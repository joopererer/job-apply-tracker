import * as cheerio from 'cheerio';
import {
  ContractType,
  JobAdapter,
  JobPlatform,
  RawJobData,
  ScrapedJob,
  ScrapeInput,
} from './types';
import {
  detectLanguage,
  extractContractType,
  extractSalaryRange,
  normalizeCompany,
  normalizeTitle,
  stripDiacritics,
} from './normalizer';

/**
 * 移除常见跟踪与分析参数（UTM、Ref、Tracker 等）
 */
export function stripTrackingParams(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const trackingPrefixes = ['utm_', 'fbclid', 'gclid', 'msclkid', 'twclid'];
    const trackingKeys = new Set([
      'ref',
      'reference',
      'source',
      'trk',
      'trackingid',
      'tracking',
      'src',
      'origin',
      'context',
      'share_id',
    ]);

    const keysToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      const lowerKey = key.toLowerCase();
      if (
        trackingPrefixes.some((prefix) => lowerKey.startsWith(prefix)) ||
        trackingKeys.has(lowerKey)
      ) {
        keysToDelete.push(key);
      }
    });

    for (const key of keysToDelete) {
      parsed.searchParams.delete(key);
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

// -------------------------------------------------------------
// 1. 各平台适配器实现 (参考 local-media-scraper 插件化解耦结构)
// -------------------------------------------------------------

export const apecAdapter: JobAdapter = {
  platform: 'APEC',
  displayName: 'Apec (Association Pour l\'Emploi des Cadres)',
  priority: 10,
  canHandle(url?: string): boolean {
    return !!url && /(?:^|https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?apec\.fr/i.test(url);
  },
  extractExternalId(url: string): string | null {
    const match = url.match(/\/detail-offre\/(\d+W?)/i);
    return match ? match[1] : null;
  },
  buildCleanUrl(url: string, externalId?: string | null): string {
    const id = externalId ?? this.extractExternalId(url);
    if (id) {
      return `https://www.apec.fr/candidat/recherche-emploi.html/emploi/detail-offre/${id}`;
    }
    return stripTrackingParams(url);
  },
};

export const helloWorkAdapter: JobAdapter = {
  platform: 'HELLOWORK',
  displayName: 'HelloWork',
  priority: 10,
  canHandle(url?: string): boolean {
    return !!url && /(?:^|https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?hellowork\.com/i.test(url);
  },
  extractExternalId(url: string): string | null {
    const match = url.match(/\/emplois\/(\d+)\.html/i);
    return match ? match[1] : null;
  },
  buildCleanUrl(url: string, externalId?: string | null): string {
    const id = externalId ?? this.extractExternalId(url);
    if (id) {
      try {
        const parsed = new URL(url);
        return `${parsed.origin}/fr-fr/emplois/${id}.html`;
      } catch {
        return `https://www.hellowork.com/fr-fr/emplois/${id}.html`;
      }
    }
    return stripTrackingParams(url);
  },
};

export const indeedAdapter: JobAdapter = {
  platform: 'INDEED',
  displayName: 'Indeed France',
  priority: 10,
  canHandle(url?: string): boolean {
    return !!url && /(?:^|https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?indeed\.com/i.test(url);
  },
  extractExternalId(url: string): string | null {
    try {
      const parsed = new URL(url);
      const jk = parsed.searchParams.get('jk') || parsed.searchParams.get('vjk');
      if (jk) return jk;
    } catch {
      // fallback to regex
    }
    const match = url.match(/[?&](?:jk|vjk)=([a-zA-Z0-9]+)/i);
    return match ? match[1] : null;
  },
  buildCleanUrl(url: string, externalId?: string | null): string {
    const id = externalId ?? this.extractExternalId(url);
    if (id) {
      return `https://fr.indeed.com/viewjob?jk=${id}`;
    }
    return stripTrackingParams(url);
  },
};

export const jobTeaserAdapter: JobAdapter = {
  platform: 'JOBTEASER',
  displayName: 'JobTeaser',
  priority: 10,
  canHandle(url?: string): boolean {
    return !!url && /(?:^|https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?jobteaser\.com/i.test(url);
  },
  extractExternalId(url: string): string | null {
    const match = url.match(/\/job-offers\/([a-f0-9-]{36})/i);
    return match ? match[1] : null;
  },
  buildCleanUrl(url: string, externalId?: string | null): string {
    const id = externalId ?? this.extractExternalId(url);
    if (id) {
      return `https://www.jobteaser.com/fr/job-offers/${id}`;
    }
    return stripTrackingParams(url);
  },
};

export const linkedInAdapter: JobAdapter = {
  platform: 'LINKEDIN',
  displayName: 'LinkedIn',
  priority: 10,
  canHandle(url?: string): boolean {
    return !!url && /(?:^|https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?linkedin\.com/i.test(url);
  },
  extractExternalId(url: string): string | null {
    const pathMatch = url.match(/\/jobs\/view\/(\d+)/i);
    if (pathMatch) return pathMatch[1];

    try {
      const parsed = new URL(url);
      const currentJobId = parsed.searchParams.get('currentJobId');
      if (currentJobId) return currentJobId;
    } catch {
      // ignore
    }

    const queryMatch = url.match(/[?&]currentJobId=(\d+)/i);
    return queryMatch ? queryMatch[1] : null;
  },
  buildCleanUrl(url: string, externalId?: string | null): string {
    const id = externalId ?? this.extractExternalId(url);
    if (id) {
      return `https://www.linkedin.com/jobs/view/${id}`;
    }
    return stripTrackingParams(url);
  },
};

export const wttjAdapter: JobAdapter = {
  platform: 'WTTJ',
  displayName: 'Welcome to the Jungle',
  priority: 10,
  canHandle(url?: string): boolean {
    return (
      !!url &&
      /(?:^|https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?welcometothejungle\.com/i.test(url)
    );
  },
  extractExternalId(url: string): string | null {
    const match = url.match(/\/companies\/[^/]+\/jobs\/([^/?#]+)/i);
    return match ? match[1] : null;
  },
  buildCleanUrl(url: string): string {
    return stripTrackingParams(url);
  },
};

export const genericAdapter: JobAdapter = {
  platform: 'OTHER',
  displayName: 'Generic Web Page',
  priority: 0,
  canHandle(): boolean {
    return true;
  },
  extractExternalId(): string | null {
    return null;
  },
  buildCleanUrl(url: string): string {
    return stripTrackingParams(url);
  },
};

/**
 * 已注册平台适配器列表（按优先级降序排序）
 */
export const PLATFORM_ADAPTERS: JobAdapter[] = [
  apecAdapter,
  helloWorkAdapter,
  indeedAdapter,
  jobTeaserAdapter,
  linkedInAdapter,
  wttjAdapter,
  genericAdapter,
];

/**
 * 根据 URL 匹配对应的平台适配器
 */
export function getAdapterForUrl(url?: string): JobAdapter {
  if (!url) return genericAdapter;
  for (const adapter of PLATFORM_ADAPTERS) {
    if (adapter.canHandle(url)) {
      return adapter;
    }
  }
  return genericAdapter;
}

// -------------------------------------------------------------
// 2. JSON-LD 与 HTML 解析核心 (Zero-Token 规则驱动引擎)
// -------------------------------------------------------------

/**
 * 递归从 JSON-LD 树中提取 JobPosting 节点
 */
function findJobPostingNode(node: any): any | null {
  if (!node || typeof node !== 'object') return null;

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPostingNode(item);
      if (found) return found;
    }
    return null;
  }

  const nodeType = node['@type'];
  if (
    nodeType === 'JobPosting' ||
    (Array.isArray(nodeType) && nodeType.includes('JobPosting'))
  ) {
    return node;
  }

  // 检查 @graph 包装
  if (node['@graph']) {
    return findJobPostingNode(node['@graph']);
  }

  return null;
}

/**
 * 从 JSON-LD 对象格式化薪资
 */
function formatBaseSalary(baseSalary: any): string | null {
  if (!baseSalary) return null;
  if (typeof baseSalary === 'string') return baseSalary.trim();
  if (typeof baseSalary === 'number') return `${baseSalary} €`;

  const currency = baseSalary.currency || '€';
  const val = baseSalary.value;

  if (val && typeof val === 'object') {
    const min = val.minValue ?? val.value;
    const max = val.maxValue;
    const unit = val.unitText ? ` / ${val.unitText}` : '';

    if (min !== undefined && max !== undefined && min !== max) {
      return `${min} - ${max} ${currency}${unit}`.trim();
    }
    if (min !== undefined) {
      return `${min} ${currency}${unit}`.trim();
    }
  } else if (typeof val === 'number' || typeof val === 'string') {
    return `${val} ${currency}`.trim();
  }

  return null;
}

/**
 * 从 JSON-LD 对象提取地理位置
 */
function formatJobLocation(jobLocation: any): string | null {
  if (!jobLocation) return null;
  if (typeof jobLocation === 'string') return jobLocation.trim();

  if (Array.isArray(jobLocation)) {
    const locs = jobLocation
      .map((l) => formatJobLocation(l))
      .filter(Boolean);
    return locs.length > 0 ? locs.join(', ') : null;
  }

  if (typeof jobLocation === 'object') {
    const address = jobLocation.address;
    if (typeof address === 'string') return address.trim();
    if (address && typeof address === 'object') {
      return (
        address.addressLocality ||
        address.addressRegion ||
        address.streetAddress ||
        null
      );
    }
    if (jobLocation.name) return jobLocation.name;
  }

  return null;
}

/**
 * 将 HTML 富文本转换为干净的换行纯文本
 */
function htmlToPlainText(html: string): string {
  if (!html) return '';
  const $ = cheerio.load(html);
  // 在块级元素后补充换行
  $('p, br, div, li, h1, h2, h3, h4, tr').after('\n');
  return $.text().replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * 从 HTML 页面中解析 JSON-LD JobPosting
 */
function extractJobPostingFromJsonLd($: cheerio.CheerioAPI): RawJobData | null {
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    const content = $(scripts[i]).html();
    if (!content) continue;

    try {
      const parsed = JSON.parse(content.trim());
      const jobPosting = findJobPostingNode(parsed);
      if (jobPosting) {
        // 提取公司名称
        let company: string | undefined;
        if (typeof jobPosting.hiringOrganization === 'string') {
          company = jobPosting.hiringOrganization;
        } else if (jobPosting.hiringOrganization?.name) {
          company = jobPosting.hiringOrganization.name;
        }

        // 提取合同类型描述
        let contractTypeRaw: string | undefined;
        if (typeof jobPosting.employmentType === 'string') {
          contractTypeRaw = jobPosting.employmentType;
        } else if (Array.isArray(jobPosting.employmentType)) {
          contractTypeRaw = jobPosting.employmentType.join(', ');
        }

        // 提取地点
        const location = formatJobLocation(jobPosting.jobLocation);

        // 提取薪资
        const salaryRange = formatBaseSalary(jobPosting.baseSalary);

        // 提取描述正文
        let jdContent = '';
        if (typeof jobPosting.description === 'string') {
          jdContent = htmlToPlainText(jobPosting.description);
        }

        return {
          title: jobPosting.title || undefined,
          company,
          contractTypeRaw,
          location,
          salaryRange,
          jdContent,
        };
      }
    } catch {
      // 容错继续查找下一个 script
    }
  }

  return null;
}

/**
 * 从 HTML 的 title / meta 标签以及纯文本后备提取
 */
function extractFromMetaAndText(
  $: cheerio.CheerioAPI | null,
  rawText?: string
): Partial<RawJobData> {
  const result: Partial<RawJobData> = {};

  let pageTitle = '';
  let metaDescription = '';
  let ogSiteName = '';

  if ($) {
    pageTitle =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      '';
    metaDescription =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';
    ogSiteName =
      $('meta[property="og:site_name"]').attr('content') || '';
  }

  const combinedText = [rawText, pageTitle, metaDescription].filter(Boolean).join('\n');

  // 1. 尝试从文本/title中识别薪资
  const detectedSalary = extractSalaryRange(combinedText);
  if (detectedSalary) {
    result.salaryRange = detectedSalary;
  }

  // 2. 从 HTML title 中尝试提取标题与公司 (如: "Développeur React chez Doctolib - Paris" 或 "Ingénieur Logiciel (H/F) - Alan")
  if (pageTitle) {
    // 常见结构: "Titre chez Entreprise", "Titre - Entreprise", "Titre | Entreprise"
    if (pageTitle.includes(' chez ')) {
      const parts = pageTitle.split(' chez ');
      result.title = parts[0]?.trim();
      const rest = parts[1]?.split(/[-|•]/)[0]?.trim();
      if (rest) result.company = rest;
    } else if (pageTitle.includes(' - ')) {
      const parts = pageTitle.split(' - ');
      result.title = parts[0]?.trim();
      if (parts[1]) result.company = parts[1]?.trim();
    } else if (pageTitle.includes(' | ')) {
      const parts = pageTitle.split(' | ');
      result.title = parts[0]?.trim();
      if (parts[1] && parts[1] !== ogSiteName) result.company = parts[1]?.trim();
    } else {
      result.title = pageTitle;
    }
  }

  // 3. 尝试从移动端分享/纯文本中通过正则与启发式提取公司、标题与地点
  if (rawText && (!result.company || !result.title)) {
    // 匹配 "chez <Entreprise>" 语法结构
    const chezMatch = rawText.match(
      /\bchez\s+([A-Za-z0-9À-ÿ\s&'.-]+?)(?=\s+(?:à|au|en|dans|\(|sur|[-|•,;:]|\n|$))/i
    );
    if (!result.company && chezMatch && chezMatch[1]) {
      result.company = chezMatch[1].trim();
    }

    // 匹配 "<Title> chez <Entreprise>"
    const titleChezMatch = rawText.match(
      /(?:(?:offre|poste)[^\n:]*?:\s*)?([^:\n]+?)\s+chez\s+/i
    );
    if (!result.title && titleChezMatch && titleChezMatch[1]) {
      let t = titleChezMatch[1]
        .replace(/^(?:d[eé]couvrez\s+(?:cette\s+)?offre(?:\s+d['’]emploi)?\s*[:\-–]?\s*)/i, '')
        .trim();
      if (t) result.title = t;
    }

    // 匹配地点 "à <Ville>"
    const locMatch = rawText.match(
      /\b(?:à|a)\s+([A-ZÀ-Ÿ][a-zà-ÿ0-9-]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ0-9-]+)?)(?=\s*(?:\(|\n|[-|•,;]|$))/
    );
    if (!result.location && locMatch && locMatch[1]) {
      result.location = locMatch[1].trim();
    }
  }

  // 4. 后备描述内容
  if (!result.jdContent) {
    result.jdContent = rawText || metaDescription || ($ ? $('body').text().trim() : '');
  }

  return result;
}

// -------------------------------------------------------------
// 3. 主解析函数入口: parseFromHtmlOrText
// -------------------------------------------------------------

/**
 * 核心解析器：
 * - 解析 URL 获取平台和外部职位 ID
 * - 第一优先级：使用 cheerio 解析 HTML 中 <script type="application/ld+json"> 的 JobPosting 节点
 * - 第二优先级：提取 HTML <title>、meta、或移动端分享的 rawText（匹配薪资正则）
 * - 执行法语/英语双语标准化清洗
 */
export function parseFromHtmlOrText(input: ScrapeInput): ScrapedJob {
  const url = input.url?.trim() || '';
  const rawText = input.rawText?.trim() || '';
  const html = input.html?.trim() || '';

  // 1. 识别平台与外部 Job ID
  const adapter = getAdapterForUrl(url);
  const platform: JobPlatform = adapter.platform;
  const externalJobId = url ? adapter.extractExternalId(url) : null;
  const cleanUrl = url ? adapter.buildCleanUrl(url, externalJobId) : '';

  let rawData: RawJobData = {
    platform,
    externalJobId,
    cleanUrl,
    title: '',
    company: '',
    contractTypeRaw: '',
    location: null,
    salaryRange: null,
    jdContent: '',
  };

  let $cheerioRoot: cheerio.CheerioAPI | null = null;
  if (html) {
    try {
      $cheerioRoot = cheerio.load(html);
    } catch {
      $cheerioRoot = null;
    }
  }

  // 2. 第一优先级：JSON-LD JobPosting 解析
  let jsonLdData: RawJobData | null = null;
  if ($cheerioRoot) {
    jsonLdData = extractJobPostingFromJsonLd($cheerioRoot);
  }

  if (jsonLdData) {
    rawData = {
      ...rawData,
      ...jsonLdData,
      platform,
      externalJobId,
      cleanUrl,
    };
  }

  // 3. 第二优先级：补全缺失字段（通过 HTML title、meta 标签或手机分享 rawText）
  const fallbackData = extractFromMetaAndText($cheerioRoot, rawText);

  if (!rawData.title && fallbackData.title) {
    rawData.title = fallbackData.title;
  }
  if (!rawData.company && fallbackData.company) {
    rawData.company = fallbackData.company;
  }
  if (!rawData.salaryRange && fallbackData.salaryRange) {
    rawData.salaryRange = fallbackData.salaryRange;
  }
  if (!rawData.jdContent) {
    rawData.jdContent = fallbackData.jdContent || rawText;
  }

  // 4. 再次对整个正文、rawText 或 HTML 进行薪资正则补全提取
  if (!rawData.salaryRange) {
    const salaryFromContent = extractSalaryRange(
      `${rawText}\n${rawData.jdContent}\n${rawData.title}`
    );
    if (salaryFromContent) {
      rawData.salaryRange = salaryFromContent;
    }
  }

  // 5. 调用 normalizer 进行标准化清洗
  const companyRaw = rawData.company?.trim() || '';
  const companyNorm = normalizeCompany(companyRaw);

  const titleRaw = rawData.title?.trim() || '';
  const titleNorm = normalizeTitle(titleRaw);

  const contractSource = [
    rawData.contractTypeRaw,
    rawData.title,
    rawText,
    rawData.jdContent,
  ]
    .filter(Boolean)
    .join(' ');
  const contractType: ContractType = extractContractType(contractSource);

  const languageText = [rawData.jdContent, rawText, rawData.title]
    .filter(Boolean)
    .join('\n');
  const language = detectLanguage(languageText);

  return {
    platform,
    externalJobId,
    cleanUrl,
    companyRaw,
    companyNorm,
    titleRaw,
    titleNorm,
    contractType,
    location: rawData.location || null,
    salaryRange: rawData.salaryRange || null,
    language,
    jdContent: rawData.jdContent || '',
  };
}
