import {
  parseFromHtmlOrText,
  getAdapterForUrl,
  PLATFORM_ADAPTERS,
  stripTrackingParams,
} from './adapters';
import { ScrapedJob, ScrapeInput } from './types';

export * from './types';
export * from './normalizer';
export * from './adapters';

/**
 * 零 Token 法国求职网站标准化解析入口 (纯本地同步解析)
 */
export function parseJob(input: ScrapeInput): ScrapedJob {
  return parseFromHtmlOrText(input);
}

/**
 * 完整刮削与标准化引擎入口：
 * - 若已提供 html 或 rawText，直接同步完成标准化解析（Zero-Token & Zero-Network）
 * - 若仅提供 url 且未提供 html，尝试以浏览器 User-Agent 获取页面 HTML，随后解析
 */
export async function scrapeJob(input: ScrapeInput): Promise<ScrapedJob> {
  if (input.html || (!input.url && input.rawText)) {
    return parseFromHtmlOrText(input);
  }

  if (input.url) {
    try {
      const response = await fetch(input.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const html = await response.text();
        return parseFromHtmlOrText({
          ...input,
          html,
        });
      }
    } catch {
      // 出现网络或反爬拦截时优雅降级为基于 URL 和已有的 rawText 进行解析
    }
  }

  return parseFromHtmlOrText(input);
}

export default scrapeJob;

