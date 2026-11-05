import { NextRequest, NextResponse } from 'next/server';
import {
  parseFromHtmlOrText,
  ScrapedJob,
  normalizeCompany,
  normalizeTitle,
  extractContractType,
  detectLanguage,
} from '@/lib/scraper';
import { supabase, ApplicationRecord, DuplicateCheckResult } from '@/lib/supabase';

/**
 * 文本相似度算法 (融合 Token Jaccard 与 Bigram Dice 系数)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  // 1. Token Jaccard
  const tokens1 = str1.split(/\s+/).filter(Boolean);
  const tokens2 = str2.split(/\s+/).filter(Boolean);
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let tokenIntersection = 0;
  for (const t of set1) {
    if (set2.has(t)) tokenIntersection++;
  }
  const tokenUnion = new Set([...tokens1, ...tokens2]).size;
  const jaccard = tokenUnion > 0 ? tokenIntersection / tokenUnion : 0;

  // 2. Character Bigram Dice
  const getBigrams = (s: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.slice(i, i + 2));
    }
    return bigrams;
  };

  const bg1 = getBigrams(str1);
  const bg2 = getBigrams(str2);
  let bgIntersection = 0;
  for (const bg of bg1) {
    if (bg2.has(bg)) bgIntersection++;
  }
  const dice =
    bg1.size + bg2.size > 0 ? (2 * bgIntersection) / (bg1.size + bg2.size) : 0;

  return Math.max(jaccard, dice);
}

/**
 * 本地多级重复投递检查后备逻辑 (在 Supabase RPC 未就绪或网络异常时自动激活)
 * L1: 同平台同 ID
 * L2: 同一 Clean URL
 * L3: 同公司且职位名相似度 > 0.45
 */
async function checkDuplicatesFallback(
  parsedJob: ScrapedJob
): Promise<DuplicateCheckResult[]> {
  const duplicates: DuplicateCheckResult[] = [];
  const matchedIds = new Set<string>();

  // L1: 同平台同 ID 检查
  if (parsedJob.platform !== 'OTHER' && parsedJob.externalJobId) {
    const { data: l1Matches } = await supabase
      .from('applications')
      .select('*')
      .eq('platform', parsedJob.platform)
      .eq('external_job_id', parsedJob.externalJobId);

    if (l1Matches && l1Matches.length > 0) {
      for (const item of l1Matches as ApplicationRecord[]) {
        matchedIds.add(item.id);
        duplicates.push({
          level: 'L1',
          reason: `L1: 同平台相同职位ID (${parsedJob.externalJobId})`,
          matchedApplication: item,
        });
      }
    }
  }

  // L2: 同一 Clean URL 检查
  if (parsedJob.cleanUrl) {
    const { data: l2Matches } = await supabase
      .from('applications')
      .select('*')
      .eq('clean_url', parsedJob.cleanUrl);

    if (l2Matches && l2Matches.length > 0) {
      for (const item of l2Matches as ApplicationRecord[]) {
        if (!matchedIds.has(item.id)) {
          matchedIds.add(item.id);
          duplicates.push({
            level: 'L2',
            reason: 'L2: 存在相同职位链接的历史投递记录',
            matchedApplication: item,
          });
        }
      }
    }
  }

  // L3: 同公司且职位名相似度 > 0.45
  if (parsedJob.companyNorm && parsedJob.titleNorm) {
    const { data: companyJobs } = await supabase
      .from('applications')
      .select('*')
      .eq('company_norm', parsedJob.companyNorm);

    if (companyJobs && companyJobs.length > 0) {
      for (const item of companyJobs as ApplicationRecord[]) {
        if (matchedIds.has(item.id)) continue;

        const similarity = calculateSimilarity(
          parsedJob.titleNorm,
          item.title_norm || ''
        );

        if (similarity > 0.45) {
          matchedIds.add(item.id);
          duplicates.push({
            level: 'L3',
            reason: `L3: 同公司类似职位匹配 (相似度 ${(similarity * 100).toFixed(0)}%)`,
            similarity: Number(similarity.toFixed(2)),
            matchedApplication: item,
          });
        }
      }
    }
  }

  return duplicates;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { url, rawText, domExtracted } = body;
    let html: string | undefined = body.html;

    // 1. 如果仅有 url 且没有 html / domExtracted，后端尝试 fetch 页面 (带超时与真实浏览器 User-Agent)
    if (url && !html && !domExtracted) {
      try {
        const fetchRes = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          signal: AbortSignal.timeout(4000),
        });

        if (fetchRes.ok) {
          html = await fetchRes.text();
        }
      } catch {
        // 遇到 403 / Cloudflare / 4000ms 超时静默捕获，绝不崩溃
      }
    }

    // 2. 调用 scraper 进行结构化解析
    let parsedJob: ScrapedJob = parseFromHtmlOrText({
      url,
      html,
      rawText,
    });

    // 3. 若前端/插件提供了 DOM 提取字段 (domExtracted)，与解析结果进行加权融合并重新归一化
    if (domExtracted && typeof domExtracted === 'object') {
      const mergedCompanyRaw =
        domExtracted.companyRaw || parsedJob.companyRaw || '';
      const mergedTitleRaw =
        domExtracted.titleRaw || parsedJob.titleRaw || '';
      const mergedJdContent =
        domExtracted.jdContent || parsedJob.jdContent || '';

      parsedJob = {
        ...parsedJob,
        ...domExtracted,
        platform: domExtracted.platform || parsedJob.platform,
        externalJobId: domExtracted.externalJobId ?? parsedJob.externalJobId,
        cleanUrl: domExtracted.cleanUrl || parsedJob.cleanUrl,
        companyRaw: mergedCompanyRaw,
        companyNorm: normalizeCompany(mergedCompanyRaw),
        titleRaw: mergedTitleRaw,
        titleNorm: normalizeTitle(mergedTitleRaw),
        contractType:
          domExtracted.contractType ||
          extractContractType(
            `${domExtracted.contractType || ''} ${mergedTitleRaw} ${mergedJdContent}`
          ) ||
          parsedJob.contractType,
        location: domExtracted.location ?? parsedJob.location,
        salaryRange: domExtracted.salaryRange ?? parsedJob.salaryRange,
        language:
          domExtracted.language ||
          detectLanguage(`${mergedJdContent} ${mergedTitleRaw}`),
        jdContent: mergedJdContent,
        postedAt: domExtracted.postedAt || parsedJob.postedAt || null,
      };
    }

    // 特殊处理 Indeed 带 vjk/jk 的分栏搜索页：强制以右侧分栏提取为准并归一化 cleanUrl
    if (url && (url.includes('vjk=') || url.includes('jk=')) && (url.includes('indeed.') || parsedJob.platform === 'INDEED')) {
      const vjkMatch = url.match(/[?&](?:vjk|jk)=([a-zA-Z0-9]+)/i);
      if (vjkMatch) {
        const vjk = vjkMatch[1];
        parsedJob.externalJobId = vjk;
        parsedJob.cleanUrl = `https://fr.indeed.com/viewjob?jk=${vjk}`;
        if (domExtracted?.titleRaw) {
          parsedJob.titleRaw = domExtracted.titleRaw;
          parsedJob.titleNorm = normalizeTitle(domExtracted.titleRaw);
        }
        if (domExtracted?.companyRaw) {
          parsedJob.companyRaw = domExtracted.companyRaw;
          parsedJob.companyNorm = normalizeCompany(domExtracted.companyRaw);
        }
      }
    }

    // 4. 调用 Supabase 检查重复投递（优先 RPC check_job_duplicates，故障时自动降级 fallback）
    let duplicates: DuplicateCheckResult[] = [];

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'check_job_duplicates',
        {
          p_platform: parsedJob.platform,
          p_external_job_id: parsedJob.externalJobId,
          p_clean_url: parsedJob.cleanUrl,
          p_company_norm: parsedJob.companyNorm,
          p_title_norm: parsedJob.titleNorm,
        }
      );

      if (!rpcError && Array.isArray(rpcData)) {
        duplicates = rpcData;
      } else {
        // RPC 不存在或报错时，执行本地高可靠查询检查
        duplicates = await checkDuplicatesFallback(parsedJob);
      }
    } catch {
      duplicates = await checkDuplicatesFallback(parsedJob);
    }

    return NextResponse.json({
      parsedJob,
      duplicates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error while parsing job' },
      { status: 500 }
    );
  }
}

