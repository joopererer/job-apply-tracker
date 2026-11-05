export type JobPlatform =
  | 'APEC'
  | 'HELLOWORK'
  | 'INDEED'
  | 'JOBTEASER'
  | 'LINKEDIN'
  | 'WTTJ'
  | 'OTHER';

export type ContractType = 'CDI' | 'CDD' | 'OTHER';

export type JobLanguage = 'FR' | 'EN';

/**
 * 标准化刮削岗位实体
 */
export interface ScrapedJob {
  platform: JobPlatform;
  externalJobId: string | null;
  cleanUrl: string;
  companyRaw: string;
  companyNorm: string;
  titleRaw: string;
  titleNorm: string;
  contractType: ContractType;
  location: string | null;
  salaryRange: string | null;
  language: JobLanguage;
  jdContent: string;
}

/**
 * 抓取器输入参数，兼容 URL、页面 HTML 或手机/剪贴板分享的纯文本
 */
export interface ScrapeInput {
  url?: string;
  html?: string;
  rawText?: string;
}

/**
 * 平台解析适配器接口 (参考 local-media-scraper 结构)
 */
export interface JobAdapter {
  platform: JobPlatform;
  displayName: string;
  priority: number;
  canHandle(url?: string): boolean;
  extractExternalId(url: string): string | null;
  buildCleanUrl(url: string, externalId?: string | null): string;
  parseSpecific?(cheerioRoot: any): Partial<ScrapedJob> | null;
}

/**
 * 原始中间数据结构
 */
export interface RawJobData {
  platform?: JobPlatform;
  externalJobId?: string | null;
  cleanUrl?: string;
  title?: string;
  company?: string;
  contractTypeRaw?: string;
  location?: string | null;
  salaryRange?: string | null;
  jdContent?: string;
}

