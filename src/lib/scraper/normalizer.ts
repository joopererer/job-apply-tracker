import { ContractType, JobLanguage } from './types';

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
 * 优先匹配 CDI/CDD，兼容英文 Permanent (-> CDI) 和 Fixed-term (-> CDD)
 */
export function extractContractType(text: string): ContractType {
  if (!text || typeof text !== 'string') return 'OTHER';

  const normalized = stripDiacritics(text).toLowerCase();

  // 1. 优先匹配标准的 CDI / CDD
  if (/\bcdi\b/i.test(normalized)) {
    return 'CDI';
  }
  if (/\bcdd\b/i.test(normalized)) {
    return 'CDD';
  }

  // 2. 兼容英文 Permanent 和 Fixed-term 及对应法文全称
  if (
    /\b(permanent|indefinite|full-time contract)\b/i.test(normalized) ||
    /duree indeterminee/i.test(normalized)
  ) {
    return 'CDI';
  }

  if (
    /\b(fixed-term|fixed term|temporary|interim)\b/i.test(normalized) ||
    /duree determinee/i.test(normalized)
  ) {
    return 'CDD';
  }

  return 'OTHER';
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

