import { ContractType, JobLanguage, WorkMode } from './types';

/**
 * 去除重音符号辅助函数
 */
export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * 法国企业常见法律形式与通用后缀
 */
const COMPANY_SUFFIX_REGEX =
  /\b(sas|sarl|sa|snc|groupe|group|france|paris|technologies|consulting|services)\b/gi;

/**
 * 公司名称标准化：
 * 转小写、去除法语重音符号、剥离法国常见企业后缀与标点符号。
 */
export function normalizeCompany(name: string): string {
  if (!name || typeof name !== 'string') return '';

  // 1. 转小写并去除重音符号
  const noAccents = stripDiacritics(name).toLowerCase();

  // 2. 剥离法国常见企业后缀
  let cleaned = noAccents.replace(COMPANY_SUFFIX_REGEX, ' ');

  // 3. 剥离非字母数字的标点符号，保留空格
  cleaned = cleaned.replace(/[^a-z0-9\s]/g, ' ');

  // 4. 压缩多余空格并 trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 若清洗后完全为空（如公司名原先即为纯后缀 "Groupe" 或 "Services"），回退到仅去标点后的名称
  if (!cleaned) {
    cleaned = stripDiacritics(name)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return cleaned;
}

/**
 * 岗位性别后缀及常见干扰词正则
 */
const GENDER_PAREN_REGEX = /\(\s*[hf]\s*\/\s*[fh](\s*\/\s*x)?\s*\)/gi;
const GENDER_BRACKET_REGEX = /\[\s*[hf]\s*\/\s*[fh](\s*\/\s*x)?\s*\]/gi;
const NOISE_WORDS_REGEX =
  /\b(h\/f|f\/h|m\/f|cdi|cdd|confirm[eé]|senior|junior|lead|stage|alternance)\b/gi;

/**
 * 岗位名称标准化：
 * 转小写、去重音，剥离法国性别后缀与合同干扰词
 */
export function normalizeTitle(title: string): string {
  if (!title || typeof title !== 'string') return '';

  // 1. 先剥离带括号的性别标记 (H/F), (F/H), (H/F/X), [H/F]
  let cleaned = title
    .replace(GENDER_PAREN_REGEX, ' ')
    .replace(GENDER_BRACKET_REGEX, ' ');

  // 2. 转小写并去除重音符号
  cleaned = stripDiacritics(cleaned).toLowerCase();

  // 3. 剥离无括号的性别与等级/合同干扰词 (h/f, cdi, senior, lead, etc.)
  cleaned = cleaned.replace(NOISE_WORDS_REGEX, ' ');

  // 4. 去除非字母数字的干扰标点（保留内部字母数字和必要空格）
  cleaned = cleaned.replace(/[-–—/|•·:;,_()[\]{}]/g, ' ');
  cleaned = cleaned.replace(/[^a-z0-9\s]/g, ' ');

  // 5. 压缩多余空格并 trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * 语言检测：
 * 统计法语特征停用词与英语特征词的出现频次，返回 'FR' 或 'EN'
 */
const FR_STOPWORDS = [
  'nous',
  'vous',
  'poste',
  'profil',
  'mission',
  'experience',
  'equipe',
];

const EN_STOPWORDS = [
  'we',
  'you',
  'role',
  'requirements',
  'experience',
  'team',
];

export function detectLanguage(text: string): JobLanguage {
  if (!text || typeof text !== 'string') return 'FR';

  const normalized = stripDiacritics(text).toLowerCase();

  let frCount = 0;
  for (const word of FR_STOPWORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalized.match(regex);
    if (matches) {
      frCount += matches.length;
    }
  }

  let enCount = 0;
  for (const word of EN_STOPWORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalized.match(regex);
    if (matches) {
      enCount += matches.length;
    }
  }

  // 法语优先或默认 'FR'
  return enCount > frCount ? 'EN' : 'FR';
}

/**
 * 合同类型提取：
 * 规则驱动精准识别 CDI, CDD, FREELANCE, ALTERNANCE, STAGE，未命中返回 UNKNOWN
 * 支持中/英/法三语识别（如 LinkedIn 中文界面的“全职”-> CDI，“实习”-> STAGE）
 */
export function extractContractType(text: string): ContractType {
  if (!text || typeof text !== 'string') return 'UNKNOWN';

  const normalized = stripDiacritics(text).toLowerCase();

  // 1. CDI: CDI, Permanent, Full-time, Temps plein, 全职, 无固定期限等
  if (
    /(?:\b(?:cdi|permanent|indefinite|full[- ]?time|temps\s+plein)\b|全职|无固定期限)/i.test(
      normalized
    ) ||
    /duree\s+indeterminee/i.test(normalized)
  ) {
    return 'CDI';
  }

  // 2. CDD: CDD, Fixed-term, Temporary, Intérim, 短期, 合同工等
  if (
    /(?:\b(?:cdd|fixed[- ]?term|temporary|interim)\b|短期|合同工|固定期限)/i.test(
      normalized
    ) ||
    /duree\s+determinee/i.test(normalized)
  ) {
    return 'CDD';
  }

  // 3. FREELANCE: Freelance, Indépendant, TJM, Auto-entrepreneur, 自由职业等
  if (
    /(?:\b(?:freelance|independant|tjm|auto[- ]?entrepreneur)\b|自由职业)/i.test(
      normalized
    )
  ) {
    return 'FREELANCE';
  }

  // 4. ALTERNANCE: Alternance, Apprentissage, Contrat pro
  if (
    /(?:\b(?:alternance|apprentissage|contrat\s+pro)\b)/i.test(normalized)
  ) {
    return 'ALTERNANCE';
  }

  // 5. STAGE: Stage, Internship, Stagiaire, 实习
  if (/(?:\b(?:stage|internship|stagiaire)\b|实习)/i.test(normalized)) {
    return 'STAGE';
  }

  return 'UNKNOWN';
}

/**
 * 办公模式提取：
 * 匹配：
 * - 现场办公：Sur site, Présentiel, On-site, 现场办公, 坐班 -> ONSITE
 * - 混合办公：Hybride, Hybrid, 混合办公, Télétravail partiel -> HYBRID
 * - 远程办公：Télétravail complet, Full remote, 100% remote, Remote, 远程办公, 远程 -> REMOTE
 */
export function extractWorkMode(text?: string | null): WorkMode | null {
  if (!text || typeof text !== 'string') return null;
  const normalized = stripDiacritics(text).toLowerCase();

  // 1. 混合办公 (优先匹配混合，避免与纯远程/纯现场冲突)
  if (
    /(?:\b(?:hybride|hybrid|teletravail\s+partiel)\b|混合办公)/i.test(normalized)
  ) {
    return 'HYBRID';
  }

  // 2. 现场办公
  if (
    /(?:\b(?:sur\s+site|sur\s+place|presentiel|on[- ]?site)\b|现场办公|坐班)/i.test(
      normalized
    )
  ) {
    return 'ONSITE';
  }

  // 3. 远程办公
  if (
    /(?:\b(?:teletravail\s+complet|full[- ]?remote|100%\s*remote|teletravail|remote)\b|远程办公|远程)/i.test(
      normalized
    )
  ) {
    return 'REMOTE';
  }

  return null;
}

/**
 * 薪资范围提取正则 (兼容 45k-55k, 45k€-55k€, 45 000 € - 55 000 €, 40-50 k€ 等)
 */
export const SALARY_RANGE_REGEX =
  /(\d{2,3}(?:[.,]\d+)?\s*[kK]?\s*€?\s*(?:-|~|à|to)\s*\d{2,3}(?:[.,]\d+)?\s*[kK]\s*€?)/i;

const SALARY_FULL_NUM_REGEX =
  /(\d{2,3}(?:\s?\d{3})?\s*€\s*(?:-|~|à|to)\s*\d{2,3}(?:\s?\d{3})?\s*€)/i;

/**
 * 从文本或描述中提取薪资范围
 */
export function extractSalaryRange(text: string): string | null {
  if (!text || typeof text !== 'string') return null;

  const matchShort = text.match(SALARY_RANGE_REGEX);
  if (matchShort && matchShort[1]) {
    return matchShort[1].trim();
  }

  const matchFull = text.match(SALARY_FULL_NUM_REGEX);
  if (matchFull && matchFull[1]) {
    return matchFull[1].trim();
  }

  return null;
}

/**
 * 将各种语言与格式的原始发布日期解析并转换为 ISO 日期字符串 (YYYY-MM-DD)
 * 支持：
 * 1. 标准 ISO 日期 (如 2026-10-25) 或法国日期 dd/mm/yyyy
 * 2. 中文相对时间 (如 "1 周前"、"3 天前"、"刚刚"、"今天"、"昨天")
 * 3. 法语相对时间 (如 "il y a 3 jours"、"publiée il y a 2j"、"hier"、"aujourd'hui")
 * 4. 英语相对时间 (如 "2 days ago"、"1 week ago"、"just posted"、"yesterday")
 */
export function parsePostedDate(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const text = raw.trim();
  if (!text) return null;

  const now = new Date();

  const toIso = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // 1. 标准 ISO 日期开头 (如 2026-10-25 或 2026-10-25T14:32:00Z)
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const d = new Date(text);
    if (!isNaN(d.getTime())) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }
  }

  // 2. 法国/欧洲常见格式：dd/mm/yyyy 或 dd-mm-yyyy (如 "Publiée le 25/10/2026" 或 "25/10/2026")
  const frDateMatch = text.match(/(?:publi[eé]e?\s*(?:le)?\s*:?\s*)?(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/i);
  if (frDateMatch) {
    const day = frDateMatch[1].padStart(2, '0');
    const month = frDateMatch[2].padStart(2, '0');
    const year = frDateMatch[3];
    return `${year}-${month}-${day}`;
  }

  const lower = stripDiacritics(text).toLowerCase();

  // 3. 极速词：今天 / 刚刚 / 昨天 / hier
  if (
    /^(aujourd'hui|aujourdhui|today|刚刚|今天|just posted)$/i.test(lower) ||
    /\b(aujourd'hui|aujourdhui|today|刚刚|今天|just posted)\b/i.test(lower)
  ) {
    return toIso(now);
  }

  if (/^(hier|yesterday|昨天)$/i.test(lower) || /\b(hier|yesterday|昨天)\b/i.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return toIso(d);
  }

  if (/^(avant-hier|前天)$/i.test(lower) || /\b(avant-hier|前天)\b/i.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() - 2);
    return toIso(d);
  }

  // 4. 中文相对时间：如 "(\d+)\s*(分钟|小时|天|周|个月)前"
  const zhMatch = text.match(/(\d+)\s*(分钟|小时|天|周|个月|月)\s*前/);
  if (zhMatch) {
    const count = parseInt(zhMatch[1], 10);
    const unit = zhMatch[2];
    const d = new Date(now);
    if (unit === '分钟') {
      d.setMinutes(d.getMinutes() - count);
    } else if (unit === '小时') {
      d.setHours(d.getHours() - count);
    } else if (unit === '天') {
      d.setDate(d.getDate() - count);
    } else if (unit === '周') {
      d.setDate(d.getDate() - count * 7);
    } else if (unit === '个月' || unit === '月') {
      d.setMonth(d.getMonth() - count);
    }
    return toIso(d);
  }

  // 5. 法语相对时间：
  // "il y a (\d+)\s*(minute|heure|jour|semaine|mois)s?"
  // 或 "publiee il y a (\d+)\s*j" 或 "il y a plus de (\d+)\s*jours"
  const frRelMatch = lower.match(
    /(?:publiee?\s+)?(?:il\s+y\s+a\s+(?:plus\s+de\s+)?)(\d+)\s*(minute|heure|jour|semaine|mois|j|m|h)s?/i
  );
  if (frRelMatch) {
    const count = parseInt(frRelMatch[1], 10);
    const unit = frRelMatch[2];
    const d = new Date(now);
    if (unit === 'minute' || unit === 'm') {
      d.setMinutes(d.getMinutes() - count);
    } else if (unit === 'heure' || unit === 'h') {
      d.setHours(d.getHours() - count);
    } else if (unit === 'jour' || unit === 'j') {
      d.setDate(d.getDate() - count);
    } else if (unit === 'semaine') {
      d.setDate(d.getDate() - count * 7);
    } else if (unit === 'mois') {
      d.setMonth(d.getMonth() - count);
    }
    return toIso(d);
  }

  // 6. 英语相对时间：
  // "(?:reposted\s+)?(\d+)\s*(minute|hour|day|week|month)s?\s*ago"
  // 或 "posted (\d+)\s*(day|week|month)s?\s*ago"
  const enRelMatch = lower.match(
    /(?:(?:re)?posted\s+)?(\d+)\s*(minute|hour|day|week|month)s?\s*ago/i
  );
  if (enRelMatch) {
    const count = parseInt(enRelMatch[1], 10);
    const unit = enRelMatch[2];
    const d = new Date(now);
    if (unit === 'minute') {
      d.setMinutes(d.getMinutes() - count);
    } else if (unit === 'hour') {
      d.setHours(d.getHours() - count);
    } else if (unit === 'day') {
      d.setDate(d.getDate() - count);
    } else if (unit === 'week') {
      d.setDate(d.getDate() - count * 7);
    } else if (unit === 'month') {
      d.setMonth(d.getMonth() - count);
    }
    return toIso(d);
  }

  // 7. 特殊简写：如 LinkedIn 中文界面的 "的时间: 1 周前" 或 "1 周前" (已由 zhMatch 处理)
  // 或 "30+ days ago" / "30+ jours"
  const plusMatch = lower.match(/(\d+)\+\s*(?:days?|jours?)\s*(?:ago)?/i);
  if (plusMatch) {
    const count = parseInt(plusMatch[1], 10);
    const d = new Date(now);
    d.setDate(d.getDate() - count);
    return toIso(d);
  }

  return null;
}

/**
 * 招聘网页常见交互与报告噪音词 (忽略大小写)
 */
const JD_NOISE_REGEX =
  /\b(afficher plus|afficher moins|voir plus|voir moins|show more|show less|read more|signaler cette offre|report job)\b/gi;

/**
 * 常见 HTML 实体解码映射
 */
const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&#160;': ' ',
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&quot;': '"',
  '&#34;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&euro;': '€',
  '&#8364;': '€',
  '&bull;': '•',
  '&#8226;': '•',
  '&middot;': '·',
  '&#183;': '·',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&hellip;': '...',
  '&#8230;': '...',
  '&ndash;': '–',
  '&#8211;': '–',
  '&mdash;': '—',
  '&#8212;': '—',
};

/**
 * JD 结构化清洗与格式化引擎：
 * 1. 将 HTML 标签结构（常见于 JSON-LD description）转换为 Markdown 风格的纯文本换行与列表
 * 2. 解码所有常见 HTML 实体（&nbsp;, &amp;, &euro; 等）
 * 3. 剥离 "Afficher plus", "Signaler cette offre" 等交互噪音残留
 * 4. 智能断行：将粘连在段落中间的列表项 (•, -, *) 转换为清晰的独立行
 * 5. 压缩多余连续空行，保持段落结构紧凑优雅
 */
export function cleanAndFormatJd(rawHtmlOrText: string): string {
  if (!rawHtmlOrText || typeof rawHtmlOrText !== 'string') return '';

  let text = rawHtmlOrText;

  // 1. 如果包含 HTML 标签结构，先做语义化标签到换行/列表符号的转换
  if (/<[a-z][\s\S]*>/i.test(text)) {
    // 列表项转换为带圆点的行
    text = text.replace(/<li[^>]*>/gi, '\n• ');
    text = text.replace(/<\/li>/gi, '\n');

    // 块级元素和换行转换为双换行
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/(p|div|section|article|h[1-6]|tr)>/gi, '\n\n');
    text = text.replace(/<(h[1-6])[^>]*>/gi, '\n\n');

    // 移除其余所有 HTML 标签
    text = text.replace(/<[^>]+>/g, '');
  }

  // 2. 解码 HTML 实体
  for (const [entity, replacement] of Object.entries(HTML_ENTITIES)) {
    text = text.split(entity).join(replacement);
  }
  // 处理未列出的十进制数字实体 &#123;
  text = text.replace(/&#(\d+);/g, (_, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10));
    } catch {
      return _;
    }
  });

  // 3. 移除招聘网页常见交互与报告噪音残留词
  text = text.replace(JD_NOISE_REGEX, '');

  // 4. 处理粘连在句子中间的无换行列表符号 (如 "équipe. • Autonomie" -> "équipe.\n• Autonomie")
  text = text.replace(/([.!?;:，。！？])\s+([•\-\*])\s+/g, '$1\n$2 ');

  // 5. 按行规整：去除每行首尾空白，保留缩进标记，清理连续空行
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    // 过滤零宽字符和全空白行
    .map((line) => line.replace(/^[\u200B\u200C\u200D\uFEFF]/, ''));

  // 重新合并并压缩多余空行 (最多连续保留 1 个空行，即 \n\n)
  let result = lines.join('\n');
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}


