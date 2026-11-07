let API_BASE = 'http://localhost:3000';

// 设置面板相关 DOM
const toggleSettingsEl = document.getElementById('toggle-settings');
const settingsPanelEl = document.getElementById('settings-panel');
const apiUrlInputEl = document.getElementById('api-url-input');
const saveApiBtnEl = document.getElementById('save-api-btn');
const resetApiBtnEl = document.getElementById('reset-api-btn');
const currentEnvLabelEl = document.getElementById('current-env-label');
const envBadgeTextEl = document.getElementById('env-badge-text');

// 初始化加载 API 地址配置
async function initApiBase() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['custom_api_url'], (result) => {
      if (result.custom_api_url) {
        API_BASE = result.custom_api_url.replace(/\/+$/, '');
        if (currentEnvLabelEl) {
          currentEnvLabelEl.textContent = '线上 Vercel';
          currentEnvLabelEl.style.color = '#34d399';
        }
        if (envBadgeTextEl) envBadgeTextEl.textContent = '线上 Vercel';
        if (apiUrlInputEl) apiUrlInputEl.value = API_BASE;
      } else {
        API_BASE = 'http://localhost:3000';
        if (currentEnvLabelEl) {
          currentEnvLabelEl.textContent = '本地服务';
          currentEnvLabelEl.style.color = '#60a5fa';
        }
        if (envBadgeTextEl) envBadgeTextEl.textContent = '本地服务';
        if (apiUrlInputEl) apiUrlInputEl.value = '';
      }
      resolve(API_BASE);
    });
  });
}

let currentParsedJob = null;
let currentDuplicates = [];
let isStarred = false;

// DOM 元素引用
const loadingEl = document.getElementById('loading');
const mainViewEl = document.getElementById('main-view');
const errorViewEl = document.getElementById('error-view');
const errorMsgEl = document.getElementById('error-msg');
const successViewEl = document.getElementById('success-view');
const successJobNameEl = document.getElementById('success-job-name');

const warningSectionEl = document.getElementById('warning-section');
const warningCountTextEl = document.getElementById('warning-count-text');
const dupListEl = document.getElementById('dup-list');
const chkForceEl = document.getElementById('chk-force');

const jobCardEl = document.getElementById('job-card');
const btnStarEl = document.getElementById('btn-star');
const starTextEl = document.getElementById('star-text');
const valPlatformEl = document.getElementById('val-platform');
const valIdEl = document.getElementById('val-id');
const valCompanyEl = document.getElementById('val-company');
const valTitleEl = document.getElementById('val-title');
const valContractEl = document.getElementById('val-contract');
const valWorkModeEl = document.getElementById('val-workmode');
const valLangEl = document.getElementById('val-lang');
const valRatingEl = document.getElementById('val-rating');
const valStatusBadgeEl = document.getElementById('val-status-badge');
const valLocationEl = document.getElementById('val-location');
const valSalaryEl = document.getElementById('val-salary');
const valPostedEl = document.getElementById('val-posted');

// 核心可编辑表单元素
const selectRatingEl = document.getElementById('select-rating');
const selectStatusEl = document.getElementById('select-status');
const selectContractEl = document.getElementById('select-contract');
const selectWorkModeEl = document.getElementById('select-workmode');
const inputPostedEl = document.getElementById('input-posted');
const inputLocationEl = document.getElementById('input-location');
const inputSalaryEl = document.getElementById('input-salary');
const inputHrEl = document.getElementById('input-hr');
const inputNotesEl = document.getElementById('input-notes');

const btnSaveEl = document.getElementById('btn-save');
const btnCloseEl = document.getElementById('btn-close');
const btnRetryEl = document.getElementById('btn-retry');
const btnOpenBoardEl = document.getElementById('btn-open-board');

// 注入当前活动标签页执行的 DOM 提取函数
async function extractPageJobData() {
  const url = window.location.href;
  const docTitle = document.title;
  const domExtracted = {};

  function stripDiacritics(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function extractSalaryRange(text) {
    if (!text || typeof text !== 'string') return null;
    const matchShort = text.match(
      /(\d{2,3}(?:[.,]\d+)?\s*[kK]?\s*€?\s*(?:-|~|à|to)\s*\d{2,3}(?:[.,]\d+)?\s*[kK]\s*€?)/i
    );
    if (matchShort && matchShort[1]) return matchShort[1].trim();

    const matchFull = text.match(
      /(\d{2,3}(?:\s?\d{3})?\s*€\s*(?:-|~|à|to)\s*\d{2,3}(?:\s?\d{3})?\s*€)/i
    );
    if (matchFull && matchFull[1]) return matchFull[1].trim();

    return null;
  }

  function extractContractType(text) {
    if (!text || typeof text !== 'string') return 'UNKNOWN';
    const norm = stripDiacritics(text).toLowerCase();

    // 1. CDI / 全职 / Permanent / Temps plein
    if (
      /(?:\b(?:cdi|permanent|indefinite|full[- ]?time|temps\s+plein)\b|全职|无固定期限)/i.test(
        norm
      ) ||
      /duree\s+indeterminee/i.test(norm)
    ) {
      return 'CDI';
    }

    // 2. CDD / 短期 / 合同工 / Fixed-term / Temporary / Intérim
    if (
      /(?:\b(?:cdd|fixed[- ]?term|temporary|interim)\b|短期|合同工|固定期限)/i.test(
        norm
      ) ||
      /duree\s+determinee/i.test(norm)
    ) {
      return 'CDD';
    }

    // 3. FREELANCE / 自由职业 / Indépendant / TJM / Auto-entrepreneur
    if (
      /(?:\b(?:freelance|independant|tjm|auto[- ]?entrepreneur)\b|自由职业)/i.test(
        norm
      )
    ) {
      return 'FREELANCE';
    }

    // 4. ALTERNANCE / Apprentissage / Contrat pro
    if (/(?:\b(?:alternance|apprentissage|contrat\s+pro)\b)/i.test(norm)) {
      return 'ALTERNANCE';
    }

    // 5. STAGE / Internship / Stagiaire / 实习
    if (/(?:\b(?:stage|internship|stagiaire)\b|实习)/i.test(norm)) {
      return 'STAGE';
    }

    return 'UNKNOWN';
  }

  function extractWorkMode(text) {
    if (!text || typeof text !== 'string') return null;
    const norm = stripDiacritics(text).toLowerCase();

    // 1. 现场办公 (需在 teletravail 前匹配，防止 "pas de teletravail" 被 teletravail 误捕获为 REMOTE)
    if (
      /(?:\b(?:pas\s+de\s+teletravail|aucun\s+teletravail|sans\s+teletravail|sur\s+site|sur\s+place|presentiel|on[- ]?site)\b|现场办公|坐班)/i.test(
        norm
      )
    ) {
      return 'ONSITE';
    }

    // 2. 混合办公 (包含 teletravail ponctuel, partiel, regulier, occasionnel, possible, flexible, 1-4 jours de teletravail 等)
    if (
      /(?:\b(?:hybride|hybrid|teletravail\s+(?:partiel|ponctuel|regulier|occasionnel|possible|flexible)|(?:\d\s*jours?|\d\s*j)\s*(?:par\s*semaine\s*)?de\s*teletravail|teletravail\s*:\s*\d\s*j)\b|混合办公)/i.test(
        norm
      )
    ) {
      return 'HYBRID';
    }

    // 3. 远程办公
    if (
      /(?:\b(?:teletravail\s+(?:complet|total)|full[- ]?remote|100%\s*remote|teletravail|remote)\b|远程办公|远程)/i.test(
        norm
      )
    ) {
      return 'REMOTE';
    }

    return null;
  }

  function dedupeLocationString(loc) {
    if (!loc || typeof loc !== 'string') return '';
    const parts = loc
      .split(/,\s*/)
      .map((p) => p.trim())
      .filter(Boolean);

    const seen = new Set();
    const uniqueParts = [];

    for (const part of parts) {
      const lower = part.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueParts.push(part);
      }
    }

    return uniqueParts.join(', ');
  }

  function parsePostedDate(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const text = raw.trim();
    if (!text) return null;

    const now = new Date();
    const toIso = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // 1. ISO 格式
    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const d = new Date(text);
      if (!isNaN(d.getTime())) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    // 2. 法国/欧洲日期 dd/mm/yyyy
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
      if (unit === '分钟') d.setMinutes(d.getMinutes() - count);
      else if (unit === '小时') d.setHours(d.getHours() - count);
      else if (unit === '天') d.setDate(d.getDate() - count);
      else if (unit === '周') d.setDate(d.getDate() - count * 7);
      else if (unit === '个月' || unit === '月') d.setMonth(d.getMonth() - count);
      return toIso(d);
    }

    // 5. 法语相对时间
    const frRelMatch = lower.match(
      /(?:publiee?\s+)?(?:il\s+y\s+a\s+(?:plus\s+de\s+)?)(\d+)\s*(minute|heure|jour|semaine|mois|j|m|h)s?/i
    );
    if (frRelMatch) {
      const count = parseInt(frRelMatch[1], 10);
      const unit = frRelMatch[2];
      const d = new Date(now);
      if (unit === 'minute' || unit === 'm') d.setMinutes(d.getMinutes() - count);
      else if (unit === 'heure' || unit === 'h') d.setHours(d.getHours() - count);
      else if (unit === 'jour' || unit === 'j') d.setDate(d.getDate() - count);
      else if (unit === 'semaine') d.setDate(d.getDate() - count * 7);
      else if (unit === 'mois') d.setMonth(d.getMonth() - count);
      return toIso(d);
    }

    // 6. 英语相对时间
    const enRelMatch = lower.match(
      /(?:(?:re)?posted\s+)?(\d+)\s*(minute|hour|day|week|month)s?\s*ago/i
    );
    if (enRelMatch) {
      const count = parseInt(enRelMatch[1], 10);
      const unit = enRelMatch[2];
      const d = new Date(now);
      if (unit === 'minute') d.setMinutes(d.getMinutes() - count);
      else if (unit === 'hour') d.setHours(d.getHours() - count);
      else if (unit === 'day') d.setDate(d.getDate() - count);
      else if (unit === 'week') d.setDate(d.getDate() - count * 7);
      else if (unit === 'month') d.setMonth(d.getMonth() - count);
      return toIso(d);
    }

    // 7. 30+ days ago / 30+ jours
    const plusMatch = lower.match(/(\d+)\+\s*(?:days?|jours?)\s*(?:ago)?/i);
    if (plusMatch) {
      const count = parseInt(plusMatch[1], 10);
      const d = new Date(now);
      d.setDate(d.getDate() - count);
      return toIso(d);
    }

    return null;
  }

  const isIndeed = /indeed\./i.test(url);
  const isLinkedIn = /linkedin\.com/i.test(url);
  const isApec = /apec\.fr/i.test(url);
  const isHelloWork = /hellowork\.com/i.test(url);

  // 判断是否为双栏/分栏搜索页
  const isIndeedSplit = isIndeed && (url.includes('vjk=') || url.includes('jk=') || url.includes('/jobs?'));
  const isLinkedInSplit = isLinkedIn && (url.includes('/jobs/search') || url.includes('/jobs/collections') || url.includes('currentJobId='));
  const isSplitPage = isIndeedSplit || isLinkedInSplit;

  // -------------------------------------------------------------
  // 一、 LinkedIn 详情与分栏提取 (基于 document.title + main.innerText 行定位)
  // -------------------------------------------------------------
  if (isLinkedIn) {
    const liIdMatch = url.match(/\/jobs\/view\/(\d+)/i) || url.match(/[?&]currentJobId=(\d+)/i);
    if (liIdMatch) {
      domExtracted.externalJobId = liIdMatch[1];
      domExtracted.cleanUrl = `https://www.linkedin.com/jobs/view/${liIdMatch[1]}`;
    }

    // 1. 提取标题 (titleRaw) 与公司 (companyRaw)：优先解析 document.title
    const cleanDocTitle = (docTitle || document.title || '').replace(/^\(\d+\)\s*/, '').trim();
    const parts = cleanDocTitle.split(/\s*\|\s*/);
    if (parts.length >= 3 && /linkedin/i.test(parts[parts.length - 1])) {
      domExtracted.titleRaw = parts[0].trim();
      domExtracted.companyRaw = parts[1].trim();
    }

    // 2. 提取办公地点 (location) 与发布日期 (postedAt)
    const liLines = (document.querySelector('main') || document.body).innerText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const metaRegex = /(\d+\s*(?:分钟|小时|天|周|个月|月)前|il y a\s+\d+|ago|\d+\s*(?:位申请者|candidats|applicants))/i;
    const metaIdx = liLines.findIndex((l) => l.includes('·') && metaRegex.test(l));

    if (metaIdx !== -1) {
      const metaLine = liLines[metaIdx];
      const metaParts = metaLine.split(/\s*·\s*/);

      // location = metaParts[0].trim()
      if (metaParts[0]) {
        domExtracted.location = metaParts[0].trim();
      }

      // postedAt：从 metaParts[1] (或其它 metaParts) 提取相对时间并换算为 YYYY-MM-DD
      if (metaParts.length > 1) {
        for (let i = 1; i < metaParts.length; i++) {
          const part = metaParts[i];
          const parsed = parsePostedDate(part);
          if (parsed) {
            domExtracted.postedAt = parsed;
            break;
          }
        }
      }

      // 如果 titleRaw 或 companyRaw 在第 1 步没拿到，则在 lines 中用 metaLine 倒推
      if (!domExtracted.titleRaw && metaIdx >= 1) {
        domExtracted.titleRaw = liLines[metaIdx - 1];
      }
      if (!domExtracted.companyRaw && metaIdx >= 2) {
        domExtracted.companyRaw = liLines[metaIdx - 2];
      }

      // 3. 提取办公模式 (workMode) 与合同类型 (contractType)：在 metaLine 所在索引 idx 往后的 8 行以内
      const followLines = liLines.slice(metaIdx + 1, metaIdx + 9);
      const followText = followLines.join(' ');

      if (/现场办公|Sur site|On-site/i.test(followText)) {
        domExtracted.workMode = 'ONSITE';
      } else if (/混合办公|Hybride|Hybrid/i.test(followText)) {
        domExtracted.workMode = 'HYBRID';
      } else if (/远程|Télétravail|Remote/i.test(followText)) {
        domExtracted.workMode = 'REMOTE';
      }

      if (/全职|CDI|Full-time|Permanent/i.test(followText)) {
        domExtracted.contractType = 'CDI';
      } else if (/CDD|合同/i.test(followText)) {
        domExtracted.contractType = 'CDD';
      } else if (/Stage|Internship|实习/i.test(followText)) {
        domExtracted.contractType = 'STAGE';
      } else if (/Alternance|Apprentissage/i.test(followText)) {
        domExtracted.contractType = 'ALTERNANCE';
      } else if (/Freelance|Indépendant/i.test(followText)) {
        domExtracted.contractType = 'FREELANCE';
      }

      for (const fl of followLines) {
        const s = extractSalaryRange(fl);
        if (s) {
          domExtracted.salaryRange = s;
          break;
        }
      }
    }

    // 4. 提取 JD 正文 (jdContent)
    let linkedinJd = '';
    const aboutIdx = liLines.findIndex((l) =>
      /^(关于职位|À propos de l’offre d’emploi|À propos de l'offre|About the job)$/i.test(l) ||
      /(关于职位|À propos de l’offre d’emploi|À propos de l'offre|About the job)/i.test(l)
    );
    if (aboutIdx !== -1) {
      const jdLines = [];
      for (let i = aboutIdx + 1; i < liLines.length; i++) {
        const l = liLines[i];
        if (
          /^(订阅相似职位|了解您与其他申请者的对比情况|想找到好工作|Créez une alerte emploi|Découvrez vos points forts|Similaires à cette offre|Autres offres susceptibles de vous intéresser)$/i.test(l) ||
          /(订阅相似职位|了解您与其他申请者的对比情况|想找到好工作|Créez une alerte emploi|Découvrez vos points forts)/i.test(l)
        ) {
          break;
        }
        jdLines.push(l);
      }
      linkedinJd = jdLines.join('\n').trim();
    }
    if (!linkedinJd) {
      const jdEl = document.querySelector('#job-details, .jobs-description__container, .jobs-box__html-content');
      if (jdEl && jdEl.innerText) {
        linkedinJd = jdEl.innerText.trim();
      }
    }
    if (linkedinJd) {
      domExtracted.jdContent = linkedinJd;
    }
  }

  // -------------------------------------------------------------
  // 二、 Indeed 详情与分栏提取 (单页与双栏全面兼容)
  // -------------------------------------------------------------
  if (isIndeed) {
    const vjkMatch = url.match(/[?&](?:vjk|jk)=([a-zA-Z0-9]+)/i);
    const vjk = vjkMatch ? vjkMatch[1] : null;

    if (vjk) {
      domExtracted.externalJobId = vjk;
      domExtracted.cleanUrl = `https://fr.indeed.com/viewjob?jk=${vjk}`;
    }

    const isSingleView = url.includes('/viewjob');

    if (isSingleView) {
      // =========================================================
      // 分支 A：Indeed 单页详情 (/viewjob)
      // =========================================================
      let rightEl = document.querySelector(
        '#jobsearch-ViewJobButtons-container, [data-testid="jobsearch-JobComponent"], .jobsearch-ViewJobLayout--embedded, .jobsearch-RightPane, #viewJobSSRRoot, main'
      );
      if (rightEl && !rightEl.innerText.includes('Description du poste')) {
        rightEl = rightEl.closest('.jobsearch-JobComponent, .jobsearch-RightPane, main') || document.body;
      }
      if (!rightEl) {
        rightEl = document.querySelector('main') || document.body;
      }

      try {
        const vjsIframe = document.querySelector('#vjs-container-iframe, iframe[title*="Job"], iframe');
        if (vjsIframe?.contentDocument?.body?.innerText?.length > 200) {
          rightEl = vjsIframe.contentDocument.body;
        }
      } catch {
        // 忽略跨域 iframe 限制
      }

      // 1. 优先读取页面 <head> 中的 meta 标签（Indeed 单页 100% 具备且最稳固）
      const metaComp = document.querySelector('meta[property="og:description"], meta[name="twitter:description"]')?.content?.trim();
      if (metaComp && !metaComp.toLowerCase().includes('indeed') && !domExtracted.companyRaw) {
        domExtracted.companyRaw = metaComp;
      }

      // 2. 从 document.title 保底提取标题与城市 (单页格式: "职位 - 地点 - Indeed.com")
      const cleanDocTitle = (docTitle || document.title || '')
        .replace(/^\(\d+\)\s*/, '')
        .trim();
      const titleParts = cleanDocTitle.split(/\s*-\s*/);
      let titleFallbackTitle = '';
      let titleFallbackLocation = '';
      if (titleParts.length >= 2) {
        const firstPart = titleParts[0].trim();
        if (
          firstPart &&
          !firstPart.toLowerCase().includes('indeed') &&
          !/plus de \d+ (?:emplois|offres)/i.test(firstPart)
        ) {
          titleFallbackTitle = firstPart;
        }
        if (titleParts.length >= 3) {
          const locPart = titleParts.slice(1, titleParts.length - 1).join('-').trim();
          if (locPart && !locPart.toLowerCase().includes('indeed')) {
            titleFallbackLocation = locPart;
          }
        }
      }

      // 3. 优先从单页 DOM 选择器提取核心字段 (支持新旧版 testid)
      const singleTitleEl = rightEl.querySelector(
        '[data-testid="vj-job-title"], [data-testid="company-info-title-row"], [data-testid="jobsearch-JobInfoHeader-title"], h1.jobsearch-JobInfoHeader-title, .jobsearch-JobInfoHeader-title, h1'
      );
      if (singleTitleEl && singleTitleEl.innerText) {
        const st = singleTitleEl.innerText.replace(/\s*-\s*job post\s*$/i, '').trim();
        if (st) domExtracted.titleRaw = st;
      }

      const singleCompEl = rightEl.querySelector(
        '[data-testid="company-info-metadata"] a, [data-testid="desktop-job-header"] a[href*="/cmp/"], a[href*="/cmp/"], [data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating'
      );
      if (singleCompEl && singleCompEl.innerText) {
        const sc = singleCompEl.innerText.replace(/[•·\s]+$/g, '').trim();
        if (sc) domExtracted.companyRaw = sc;
      }

      // 提取地点：遍历寻找非空、非圆点、非评分纯数字的文本
      const locCandidates = rightEl.querySelectorAll(
        '[data-testid="company-info-metadata"] div[dir="ltr"], [data-testid="inlineHeader-companyLocation"], [data-testid="job-location"], [data-testid="jobsearch-JobInfoHeader-companyLocation"]'
      );
      for (const el of locCandidates) {
        const txt = el.innerText.replace(/Description du poste.*$/i, '').replace(/[•·\s]+$/g, '').trim();
        if (txt && txt !== '•' && txt !== '·' && !/^\d+(?:[.,]\d+)?$/.test(txt)) {
          domExtracted.location = txt;
          break;
        }
      }

      // 4. 基于锚点行文本回退提取
      const lines = (rightEl || document.body).innerText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      const startIdx = lines.findIndex((l) => /Début du contenu principal/i.test(l));
      const applyIdx = lines.findIndex((l) =>
        /Continuer pour postuler|Postuler maintenant|Postuler sur le site/i.test(l)
      );

      if (startIdx !== -1) {
        // 过滤掉紧跟在 startIdx 后面的 "Rechercher" 干扰行
        const validAfterStart = lines.slice(startIdx + 1, startIdx + 6).filter((l) => !/^Rechercher$/i.test(l));
        if (!domExtracted.titleRaw && validAfterStart[0] && !/Continuer pour postuler|Postuler/i.test(validAfterStart[0])) {
          domExtracted.titleRaw = validAfterStart[0].replace(/\s*-\s*job post\s*$/i, '').trim();
        }
        if (!domExtracted.companyRaw && validAfterStart[1] && !/Continuer pour postuler|Postuler/i.test(validAfterStart[1])) {
          domExtracted.companyRaw = validAfterStart[1].trim();
        }
        if (!domExtracted.location && validAfterStart[2] && !/Continuer pour postuler|Postuler/i.test(validAfterStart[2])) {
          domExtracted.location = validAfterStart[2].trim();
        }
      } else if (applyIdx !== -1) {
        if (applyIdx >= 4) {
          if (!domExtracted.titleRaw) domExtracted.titleRaw = lines[applyIdx - 4].replace(/\s*-\s*job post\s*$/i, '').trim();
          if (!domExtracted.companyRaw) domExtracted.companyRaw = lines[applyIdx - 3].trim();
          if (!domExtracted.location) domExtracted.location = lines[applyIdx - 2].trim();
        } else if (applyIdx >= 3) {
          if (!domExtracted.titleRaw) domExtracted.titleRaw = lines[applyIdx - 3].replace(/\s*-\s*job post\s*$/i, '').trim();
          if (!domExtracted.companyRaw) domExtracted.companyRaw = lines[applyIdx - 2].trim();
          if (!domExtracted.location) domExtracted.location = lines[applyIdx - 1].trim();
        }
      }

      // 5. 从 Trouvé sur ... 二次确认地点
      const allIndeedText = (rightEl || document.body).innerText || '';
      const matchTrouve = allIndeedText.match(/Trouv[eé]\s+sur\s+([^\n\r]+)/i);
      if (matchTrouve && matchTrouve[1]) {
        domExtracted.location = matchTrouve[1].replace(/Description du poste.*$/i, '').replace(/[•·\s]+$/g, '').trim();
      }

      // 兜底保底
      if (!domExtracted.titleRaw) domExtracted.titleRaw = titleFallbackTitle;
      if (!domExtracted.location) domExtracted.location = titleFallbackLocation;

      // 避免公司与地点错配
      if (
        domExtracted.location &&
        domExtracted.companyRaw &&
        domExtracted.location.toLowerCase() === domExtracted.companyRaw.toLowerCase()
      ) {
        if (matchTrouve && matchTrouve[1]) {
          domExtracted.location = matchTrouve[1].replace(/Description du poste.*$/i, '').trim();
        } else if (titleFallbackLocation) {
          domExtracted.location = titleFallbackLocation;
        } else {
          domExtracted.location = null;
        }
      }

      // 扫描合同、薪资与办公方式
      const detailsIdx = lines.findIndex((l) => /Détails du poste|Job details/i.test(l));
      const descIdx = lines.findIndex((l) => /Description du poste|Full job description/i.test(l));

      if (detailsIdx !== -1 && descIdx !== -1 && descIdx > detailsIdx) {
        const detailsLines = lines.slice(detailsIdx + 1, descIdx);
        const detailsBlock = detailsLines.join('\n');

        const cMatch = detailsBlock.match(/\b(CDI|CDD|Freelance|Stage|Alternance|Indépendant|Independant)\b/i);
        if (cMatch) {
          const cType = extractContractType(cMatch[1]);
          if (cType && cType !== 'UNKNOWN') domExtracted.contractType = cType;
        }

        if (/Aucun salaire indiqué/i.test(detailsBlock)) {
          domExtracted.salaryRange = null;
        } else {
          const sRange = extractSalaryRange(detailsBlock);
          if (sRange) domExtracted.salaryRange = sRange;
        }

        const wMode = extractWorkMode(detailsBlock);
        if (wMode) domExtracted.workMode = wMode;
      }

      // 提取 JD 正文
      let indeedJd = '';
      if (descIdx !== -1) {
        indeedJd = lines.slice(descIdx + 1).join('\n').trim();
      } else {
        const jdEl = (rightEl || document).querySelector('#jobDescriptionText');
        if (jdEl && jdEl.innerText) indeedJd = jdEl.innerText.trim();
      }
      if (indeedJd) domExtracted.jdContent = indeedJd;

      // 发布日期
      const dateEl = (rightEl || document).querySelector(
        '[data-testid="myJobsStateDate"], .jobsearch-JobMetadataFooter, [data-testid="hiring-insights"]'
      );
      const dateText = (dateEl ? dateEl.innerText : '') || allIndeedText;
      const dateMatch = dateText.match(
        /(?:publi[eé]e?\s+)?(?:il\s+y\s+a\s+[\w\s\+]+|just posted|today|hier|\d+\+?\s*(?:jours?|days?)\s*(?:ago)?|\d+\s*(?:天|周|个月)\s*前)/i
      );
      if (dateMatch) {
        const parsed = parsePostedDate(dateMatch[0].trim());
        if (parsed) domExtracted.postedAt = parsed;
      }

    } else {
      // =========================================================
      // 分支 B：Indeed 双栏搜索页 (/jobs)
      // 完美兼容换行显示 (Form 1) 与滚动时一行显示 (Form 2)
      // =========================================================
      const allDocs = [document];
      try {
        const iframes = Array.from(document.querySelectorAll('iframe'));
        for (const f of iframes) {
          try {
            if (f.contentDocument) allDocs.push(f.contentDocument);
          } catch {
            // 忽略跨域 iframe 限制
          }
        }
      } catch {
        // 忽略异常
      }

      let targetDoc = document;
      let rightRoot = null;

      // 在所有文档中寻找专属于右侧详情面板的容器（在双栏搜索页严禁使用 main）
      const rightPaneSelectors = [
        '.jobsearch-RightPane',
        '.jobsearch-ViewJobLayout--embedded',
        '.jobsearch-JobComponent',
        '#jobsearch-ViewjobPaneWrapper',
        '[data-testid="jobsearch-JobComponent"]',
        '[data-testid="rnvj-content-layer"]',
        '#viewJobSSRRoot',
        '#vjs-container'
      ].join(', ');

      for (const d of allDocs) {
        const found = d.querySelector(rightPaneSelectors);
        if (found) {
          targetDoc = d;
          rightRoot = found;
          break;
        }
      }

      let rawSourceText = rightRoot ? (rightRoot.innerText || '') : '';

      const isBadVal = (val) =>
        !val ||
        /^(Rechercher|Keyword\s*:|Edit location|nbsp|Passer au contenu principal|Début du contenu principal|Trier par|pertinence|Dates|Job Post Details)$/i.test(
          val
        ) ||
        /(?:Trier par|pertinence|\bdate\b|Keyword\s*:|Edit location|Emplois\s+[a-z]+)/i.test(val) ||
        val.length > 300;

      // 1. 双栏右侧详情容器提取：全面适配滚动时一行紧凑头 (desktop-embedded-compact-header) 与正常换行头 (desktop-job-header)
      if (rightRoot && typeof rightRoot.querySelector === 'function') {
        const compactHeader = rightRoot.querySelector('[data-testid="desktop-embedded-compact-header"]');
        if (compactHeader) {
          // 紧凑标题
          const compactTitleEl = compactHeader.querySelector('[data-testid="vj-job-title-compact"], h4');
          if (compactTitleEl && compactTitleEl.innerText) {
            const cleanT = compactTitleEl.innerText.replace(/\s*-\s*job post\s*$/i, '').trim();
            if (cleanT && !isBadVal(cleanT)) domExtracted.titleRaw = cleanT;
          }

          // 紧凑公司：直接读取紧凑头部的 a 链接（不限 href 是否含 /cmp/）或带 company testid 的元素
          const compactCompLink = compactHeader.querySelector('a, [data-testid*="company"]');
          if (compactCompLink && compactCompLink.innerText) {
            const cleanC = compactCompLink.innerText.replace(/[•·\s]+$/g, '').trim();
            if (cleanC && !isBadVal(cleanC)) domExtracted.companyRaw = cleanC;
          }

          // 紧凑头部的点号分割子行：公司 • 地点 • 办公方式 • 薪资
          const titleText = compactTitleEl ? (compactTitleEl.innerText || '') : '';
          const subLineText = (compactHeader.innerText || '').replace(titleText, '').trim();
          const dotParts = subLineText.split(/[•·]/).map((s) => s.trim()).filter(Boolean);
          if (dotParts.length > 0) {
            if ((!domExtracted.companyRaw || isBadVal(domExtracted.companyRaw)) && dotParts[0] && !isBadVal(dotParts[0])) {
              domExtracted.companyRaw = dotParts[0].replace(/[•·\s]+$/g, '').trim();
            }
            if ((!domExtracted.location || isBadVal(domExtracted.location)) && dotParts[1] && !isBadVal(dotParts[1])) {
              domExtracted.location = dotParts[1].replace(/Description du poste.*$/i, '').trim();
            }
            for (let i = 1; i < dotParts.length; i++) {
              const part = dotParts[i];
              if (/télétravail|présentiel|presentiel|hybride|remote/i.test(part) && (!domExtracted.workMode || domExtracted.workMode === 'UNKNOWN')) {
                domExtracted.workMode = extractWorkMode(part);
              }
              if (/€|\bsalaire\b|\ban\b|\bmois\b/i.test(part) && !domExtracted.salaryRange) {
                const s = extractSalaryRange(part);
                if (s) domExtracted.salaryRange = s;
              }
              if (/\b(CDI|CDD|Stage|Alternance|Freelance)\b/i.test(part) && (!domExtracted.contractType || domExtracted.contractType === 'UNKNOWN')) {
                const c = extractContractType(part);
                if (c && c !== 'UNKNOWN') domExtracted.contractType = c;
              }
            }
          }
        }

        // 标准未缩起头部
        if (!domExtracted.titleRaw || isBadVal(domExtracted.titleRaw)) {
          const titleEl = rightRoot.querySelector(
            '[data-testid="vj-job-title"], [data-testid="company-info-title-row"], [data-testid="jobsearch-JobInfoHeader-title"], h1.jobsearch-JobInfoHeader-title, .jobsearch-JobInfoHeader-title, h1'
          );
          if (titleEl && titleEl.innerText) {
            const cleanT = titleEl.innerText.replace(/\s*-\s*job post\s*$/i, '').trim();
            if (cleanT && !isBadVal(cleanT)) domExtracted.titleRaw = cleanT;
          }
        }

        if (!domExtracted.companyRaw || isBadVal(domExtracted.companyRaw)) {
          const compEl = rightRoot.querySelector(
            '[data-testid="company-info-metadata"] a, [data-testid="desktop-job-header"] a, a[href*="/cmp/"], [data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating'
          );
          if (compEl && compEl.innerText) {
            const cleanC = compEl.innerText.replace(/[•·\s]+$/g, '').trim();
            if (cleanC && !isBadVal(cleanC)) domExtracted.companyRaw = cleanC;
          } else {
            const metaBox = rightRoot.querySelector('[data-testid="company-info-metadata"]');
            if (metaBox) {
              const firstChild = metaBox.firstElementChild;
              if (firstChild && firstChild.innerText) {
                const fcText = firstChild.innerText.replace(/[•·\s]+$/g, '').trim();
                if (fcText && !/^\d+(?:[.,]\d+)?$/.test(fcText) && !isBadVal(fcText)) {
                  domExtracted.companyRaw = fcText;
                }
              }
            }
          }
        }

        if (!domExtracted.location || isBadVal(domExtracted.location)) {
          const locCandidates = rightRoot.querySelectorAll(
            '[data-testid="company-info-metadata"] div[dir="ltr"], [data-testid="inlineHeader-companyLocation"], [data-testid="job-location"]'
          );
          for (const el of locCandidates) {
            const cleanL = el.innerText.replace(/Description du poste.*$/i, '').replace(/[•·\s]+$/g, '').trim();
            if (cleanL && cleanL !== '•' && cleanL !== '·' && !/^\d+(?:[.,]\d+)?$/.test(cleanL) && !isBadVal(cleanL)) {
              domExtracted.location = cleanL;
              break;
            }
          }
        }
      }

      // 2. 检测右侧当前展示职位的真实 Job ID (解决 URL 中 vjk 滞后导致读成首个职位的 Bug)
      const applyLink = rightRoot ? rightRoot.querySelector(
        '[data-testid="primary-apply-action"] a, [data-testid="viewjob-button-container"] a, a[href*="/applystart"], a[href*="jk="]'
      ) : null;
      const applyHref = applyLink ? (applyLink.getAttribute('href') || '') : '';
      const jkFromApply = applyHref.match(/[?&]jk=([a-zA-Z0-9]+)/i)?.[1];

      // 左侧高亮选中卡片（.vjs-highlight 绝对优先于根据 URL 的 vjk 查询）
      const highlightedEl = document.querySelector(
        '.vjs-highlight, .jobsearch-SerpJobCard.selected, [data-testid="jobsearch-JobCard"].selected, li.selected'
      );
      let activeCard = highlightedEl ? (highlightedEl.closest('.cardOutline, [data-testid="jobsearch-JobCard"], li, .result') || highlightedEl) : null;

      if (!activeCard && vjk) {
        const cardEl = document.querySelector(`[data-jk="${vjk}"], [data-mobtk*="${vjk}"]`);
        if (cardEl) {
          activeCard = cardEl.closest('.cardOutline, [data-testid="jobsearch-JobCard"], li, .result') || cardEl;
        }
      }

      const jkFromCard = activeCard ? (activeCard.querySelector('[data-jk]')?.getAttribute('data-jk') || activeCard.getAttribute('data-jk')) : null;
      const realActiveJk = jkFromApply || jkFromCard || vjk;
      if (realActiveJk) {
        domExtracted.externalJobId = realActiveJk;
        domExtracted.cleanUrl = `https://fr.indeed.com/viewjob?jk=${realActiveJk}`;
      }

      // 若右侧容器中未能识别标题/公司/地点，从左侧激活卡片兜底补充
      if (activeCard) {
        if (!domExtracted.titleRaw || isBadVal(domExtracted.titleRaw)) {
          const cardTitleEl = activeCard.querySelector(
            'a.jcs-JobTitle span, a.jcs-JobTitle, h2.jobTitle, h2 span, [data-testid="job-title"]'
          );
          if (cardTitleEl && cardTitleEl.innerText) {
            const ct = cardTitleEl.innerText.replace(/\s*-\s*job post\s*$/i, '').trim();
            if (ct && !isBadVal(ct)) domExtracted.titleRaw = ct;
          }
        }

        if (!domExtracted.companyRaw || isBadVal(domExtracted.companyRaw)) {
          const cardCompEl = activeCard.querySelector(
            '[data-testid="company-name"], span.companyName, [data-testid="job-company"]'
          );
          if (cardCompEl && cardCompEl.innerText) {
            const cc = cardCompEl.innerText.replace(/[•·\s]+$/g, '').trim();
            if (cc && !isBadVal(cc)) domExtracted.companyRaw = cc;
          }
        }

        if (!domExtracted.location || isBadVal(domExtracted.location)) {
          const cardLocEl = activeCard.querySelector(
            '[data-testid="text-location"], [data-testid="job-location"], div.companyLocation'
          );
          if (cardLocEl && cardLocEl.innerText) {
            const cl = cardLocEl.innerText.replace(/Description du poste.*$/i, '').replace(/[•·\s]+$/g, '').trim();
            if (cl && !isBadVal(cl)) domExtracted.location = cl;
          }
        }
      }

      // 3. 增强“投递按钮向上倒推法”过滤
      const isNoiseLine = (l) => {
        if (!l) return true;
        if (/^\d+$/.test(l)) return true;
        if (
          /performance\.mark|window.|functions*\(|var\s+|const\s+|let\s+|\{|\}|=>|document\.|\.start\b|\.end\b|<\/?[a-z]+/i.test(
            l
          ) ||
          l.length > 500
        ) {
          return true;
        }
        if (
          /Trier par|pertinence|\bdate\b|Keyword|Rechercher|Début du contenu principal|Passer au contenu principal|Edit location|new update|Search|Find jobs|All jobs|Emplois flutter|Dates\b/i.test(
            l
          )
        ) {
          return true;
        }
        return false;
      };

      const lines = (rawSourceText || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !isNoiseLine(l));

      let applyIdx = lines.findIndex((l) =>
        /^(Continuer pour postuler|Postuler maintenant|Postuler sur le site|Candidature simplifi[eé]e|Apply now)/i.test(
          l
        )
      );
      if (applyIdx === -1) {
        applyIdx = lines.findIndex((l) => /^(Détails du poste|Job details)/i.test(l));
      }

      let preLines = [];
      if (applyIdx !== -1) {
        preLines = lines.slice(Math.max(0, applyIdx - 4), applyIdx);
        const lastLine = preLines.length > 0 ? preLines[preLines.length - 1] : '';

        const isDotLine = /[•·]/.test(lastLine);
        const isContractLine =
          /^(CDI|CDD|Stage|Alternance|Freelance|Indépendant|Independant|Intérim|Interim|Temps plein)/i.test(
            lastLine
          );

        if (isDotLine) {
          const dotParts = lastLine.split(/[•·]/).map((s) => s.trim()).filter(Boolean);
          if (dotParts.length > 0) {
            if ((!domExtracted.companyRaw || isBadVal(domExtracted.companyRaw)) && dotParts[0] && !isBadVal(dotParts[0])) {
              domExtracted.companyRaw = dotParts[0].replace(/[•·\s]+$/g, '').trim();
            }
            if ((!domExtracted.location || isBadVal(domExtracted.location)) && dotParts[1] && !isBadVal(dotParts[1])) {
              domExtracted.location = dotParts[1].replace(/Description du poste.*$/i, '').trim();
            }
            for (let i = 1; i < dotParts.length; i++) {
              const part = dotParts[i];
              if (/télétravail|présentiel|presentiel|hybride|remote/i.test(part) && (!domExtracted.workMode || domExtracted.workMode === 'UNKNOWN')) {
                domExtracted.workMode = extractWorkMode(part);
              }
              if (/€|\bsalaire\b|\ban\b|\bmois\b/i.test(part) && !domExtracted.salaryRange) {
                const s = extractSalaryRange(part);
                if (s) domExtracted.salaryRange = s;
              }
              if (/\b(CDI|CDD|Stage|Alternance|Freelance)\b/i.test(part) && (!domExtracted.contractType || domExtracted.contractType === 'UNKNOWN')) {
                const c = extractContractType(part);
                if (c && c !== 'UNKNOWN') domExtracted.contractType = c;
              }
            }
          }
          if ((!domExtracted.titleRaw || isBadVal(domExtracted.titleRaw)) && preLines.length >= 2) {
            const tCand = preLines[preLines.length - 2].replace(/\s*-\s*job post\s*$/i, '').trim();
            if (!isBadVal(tCand)) domExtracted.titleRaw = tCand;
          }
        } else if (isContractLine && preLines.length >= 3) {
          if (!domExtracted.contractType || domExtracted.contractType === 'UNKNOWN') {
            const cType = extractContractType(lastLine);
            if (cType && cType !== 'UNKNOWN') domExtracted.contractType = cType;
          }
          if (!domExtracted.location || isBadVal(domExtracted.location)) {
            const lCand = preLines[preLines.length - 2].replace(/Description du poste.*$/i, '').replace(/[•·\s]+$/g, '').trim();
            if (!isBadVal(lCand)) domExtracted.location = lCand;
          }
          if (!domExtracted.companyRaw || isBadVal(domExtracted.companyRaw)) {
            const cCand = preLines[preLines.length - 3].replace(/[•·\s]+$/g, '').trim();
            if (!isBadVal(cCand)) domExtracted.companyRaw = cCand;
          }
          if (!domExtracted.titleRaw || isBadVal(domExtracted.titleRaw)) {
            const tCand = preLines[preLines.length - 4].replace(/\s*-\s*job post\s*$/i, '').trim();
            if (!isBadVal(tCand)) domExtracted.titleRaw = tCand;
          }
        } else if (!isContractLine && preLines.length >= 2) {
          if (!domExtracted.location || isBadVal(domExtracted.location)) {
            const lCand = preLines[preLines.length - 1].replace(/Description du poste.*$/i, '').replace(/[•·\s]+$/g, '').trim();
            if (!isBadVal(lCand)) domExtracted.location = lCand;
          }
          if (!domExtracted.companyRaw || isBadVal(domExtracted.companyRaw)) {
            const cCand = preLines[preLines.length - 2].replace(/[•·\s]+$/g, '').trim();
            if (!isBadVal(cCand)) domExtracted.companyRaw = cCand;
          }
          if (!domExtracted.titleRaw || isBadVal(domExtracted.titleRaw)) {
            const tCand = preLines[preLines.length - 3].replace(/\s*-\s*job post\s*$/i, '').trim();
            if (!isBadVal(tCand)) domExtracted.titleRaw = tCand;
          }
        }
      }

      // 4. Trouvé sur ... 地点保底
      const trouveLine = lines.find((l) => /^Trouv[eé]\s+sur\s+(.+)$/i.test(l));
      let trouveLocation = '';
      if (trouveLine) {
        const match = trouveLine.match(/^Trouv[eé]\s+sur\s+(.+)$/i);
        if (match && match[1]) {
          trouveLocation = match[1].replace(/Description du poste.*$/i, '').replace(/[•·\s]+$/g, '').trim();
          if (trouveLocation && !isBadVal(trouveLocation)) domExtracted.location = trouveLocation;
        }
      }
      if (!domExtracted.location && rightRoot && rightRoot.innerText) {
        const matchInRoot = rightRoot.innerText.match(/Trouv[eé]\s+sur\s+([^\n\r]+)/i);
        if (matchInRoot && matchInRoot[1]) {
          const lCand = matchInRoot[1].replace(/Description du poste.*$/i, '').replace(/[•·\s]+$/g, '').trim();
          if (lCand && !isBadVal(lCand)) domExtracted.location = lCand;
        }
      }

      if (
        domExtracted.location &&
        domExtracted.companyRaw &&
        domExtracted.location.toLowerCase() === domExtracted.companyRaw.toLowerCase()
      ) {
        if (trouveLocation) domExtracted.location = trouveLocation;
        else domExtracted.location = null;
      }

      if (isBadVal(domExtracted.titleRaw)) domExtracted.titleRaw = '';
      if (isBadVal(domExtracted.companyRaw)) domExtracted.companyRaw = '';
      if (isBadVal(domExtracted.location)) domExtracted.location = trouveLocation || null;

      // 5. 详情块：合同、薪资、办公模式
      const detailsIdx = lines.findIndex((l) => /Détails du poste|Job details/i.test(l));
      const descIdx = lines.findIndex((l) => /Description du poste|Full job description/i.test(l));

      let detailsLines = [];
      if (detailsIdx !== -1 && descIdx !== -1 && descIdx > detailsIdx) {
        detailsLines = lines.slice(detailsIdx + 1, descIdx);
      }

      const detailsBlock = detailsLines.join('\n');
      const restrictedLines = [...preLines, ...detailsLines];
      const restrictedText = restrictedLines.join('\n');

      if (!domExtracted.contractType || domExtracted.contractType === 'UNKNOWN') {
        const cMatch = restrictedText.match(
          /\b(CDI|CDD|Stage|Alternance|Freelance|Indépendant|Independant|Intérim|Temps plein)\b/i
        );
        if (cMatch) {
          const cType = extractContractType(cMatch[1]);
          if (cType && cType !== 'UNKNOWN') domExtracted.contractType = cType;
        }
      }

      if (/Aucun salaire indiqué/i.test(detailsBlock)) {
        domExtracted.salaryRange = null;
      } else if (detailsBlock) {
        const sRange = extractSalaryRange(detailsBlock);
        if (sRange) domExtracted.salaryRange = sRange;
      }

      if (
        restrictedText &&
        /Télétravail|Teletravail|Hybride|Hybrid|Sur site|Présentiel|Presentiel/i.test(restrictedText)
      ) {
        domExtracted.workMode = extractWorkMode(restrictedText);
      } else {
        domExtracted.workMode = null;
      }

      const dateMatch = restrictedText.match(
        /(?:publi[eé]e?\s+)?(?:il\s+y\s+a\s+[\w\s\+]+|just posted|today|hier|\d+\+?\s*(?:jours?|days?)\s*(?:ago)?|\d+\s*(?:天|周|个月)\s*前)/i
      );
      if (dateMatch) {
        const parsed = parsePostedDate(dateMatch[0].trim());
        domExtracted.postedAt = parsed || null;
      } else {
        domExtracted.postedAt = null;
      }

      let indeedJd = '';
      if (descIdx !== -1) {
        indeedJd = lines.slice(descIdx + 1).join('\n').trim();
      } else {
        const jdEl = (targetDoc || document).querySelector('#jobDescriptionText');
        if (jdEl && jdEl.innerText) indeedJd = jdEl.innerText.trim();
      }
      if (indeedJd) domExtracted.jdContent = indeedJd;
    }
  }

  // -------------------------------------------------------------
  // 三、 Apec & HelloWork 专属 DOM 详情与字段补充
  // -------------------------------------------------------------
  if (isApec) {
    domExtracted.platform = 'APEC';

    // 1. 外部职位 ID 与标准 cleanUrl
    const apecIdMatch = url.match(/\/detail-offre\/([a-zA-Z0-9]+)/i);
    if (apecIdMatch) {
      domExtracted.externalJobId = apecIdMatch[1];
      domExtracted.cleanUrl = `https://www.apec.fr/candidat/recherche-emploi.html/emploi/detail-offre/${apecIdMatch[1]}`;
    }

    // 2. 职位标题 (titleRaw)
    const titleEl = document.querySelector(
      '#rod-detail-keypoints-title, apec-offre-infos-cles h1, .rod-detail-keypoints-infos h1, .rod-detail-main h1'
    );
    if (titleEl && titleEl.innerText) {
      const cleanTitle = titleEl.innerText.trim();
      if (cleanTitle && !/recherche/i.test(cleanTitle)) {
        domExtracted.titleRaw = cleanTitle;
      }
    }

    // 3. 公司名称 (companyRaw)
    const companyEl = document.querySelector(
      '.rod-detail-keypoints-infos--company p, .rod-detail-keypoints-infos--company, .card-offer__company, .company-name'
    );
    if (companyEl && companyEl.innerText) {
      const cleanComp = companyEl.innerText.trim();
      if (cleanComp && !/confidentielle/i.test(cleanComp)) {
        domExtracted.companyRaw = cleanComp;
      }
    }

    // 4. 工作地点 (location)
    const locationEl = document.querySelector(
      '.rod-detail-keypoints-infos--adress p, .rod-detail-keypoints-infos--adress, .card-offer-location'
    );
    if (locationEl && locationEl.innerText) {
      let locText = locationEl.innerText.replace(/Localiser\s+l'adresse/gi, '').trim();
      if (locText) {
        domExtracted.location = dedupeLocationString(locText);
      }
    }

    // 5. 发布/更新时间 (postedAt)
    const apecDateEl = document.querySelector(
      '.rod-detail-keypoints-infos--date p, .rod-detail-keypoints-infos--date, .date-publication, .card-offer__date'
    );
    if (apecDateEl && apecDateEl.innerText) {
      const parsed = parsePostedDate(apecDateEl.innerText.trim());
      domExtracted.postedAt = parsed || apecDateEl.innerText.trim();
    }

    // 6. 关键标签提炼：办公方式 (workMode)、合同类型 (contractType)、薪资范围 (salaryRange)
    const tagElements = Array.from(
      document.querySelectorAll(
        '.rod-detail-keypoints-tags .rod-tooltip-container span, .rod-detail-keypoints-tags span, .rod-tags, .tag-item'
      )
    );
    for (const tagEl of tagElements) {
      const tagText = (tagEl.innerText || '').trim();
      if (!tagText) continue;

      // 6.1 办公方式 (Télétravail ponctuel, partiel, régulier, complet 等)
      if (!domExtracted.workMode || domExtracted.workMode === 'UNKNOWN') {
        const mode = extractWorkMode(tagText);
        if (mode) domExtracted.workMode = mode;
      }

      // 6.2 合同类型 (CDI, CDD, Stage, Alternance 等)
      if (!domExtracted.contractType || domExtracted.contractType === 'UNKNOWN') {
        const cType = extractContractType(tagText);
        if (cType && cType !== 'UNKNOWN') domExtracted.contractType = cType;
      }

      // 6.3 薪资范围 (如 42 - 52 k€ brut annuel)
      if (!domExtracted.salaryRange) {
        const salary = extractSalaryRange(tagText);
        if (salary) domExtracted.salaryRange = salary;
      }
    }

    // 7. 详情正文
    const jdContainer = document.querySelector(
      'apec-poste-informations, .rod-detail-main, .rod-detail-description, .offre-content'
    );
    if (jdContainer && jdContainer.innerText) {
      domExtracted.jdContent = jdContainer.innerText.trim();
    }
  }

  if (isHelloWork) {
    const hwDateEl = document.querySelector('[data-testid="job-meta-date"], .offer-header-date');
    if (hwDateEl && hwDateEl.innerText) {
      const parsed = parsePostedDate(hwDateEl.innerText.trim());
      domExtracted.postedAt = parsed || hwDateEl.innerText.trim();
    }
  }

  // -------------------------------------------------------------
  // 四、 收集 JSON-LD 标签内容 (分栏页严禁读取外层可能属于其他职位的 JSON-LD)
  // -------------------------------------------------------------
  let jsonLdHtml = '';
  if (!isSplitPage) {
    const jsonLdElements = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );
    jsonLdHtml = jsonLdElements
      .map((el) => `<script type="application/ld+json">${el.textContent || ''}</script>`)
      .join('\n');
  }

  // -------------------------------------------------------------
  // 五、 详情正文容器提取
  // -------------------------------------------------------------
  let bodyContainerText = '';
  if (domExtracted.jdContent) {
    bodyContainerText = domExtracted.jdContent;
  } else {
    const detailContainerRoot = isIndeed
      ? document.querySelector('.jobsearch-RightPane, .jobsearch-ViewJobLayout--embedded, .jobsearch-JobComponent') || document.body
      : isLinkedIn
        ? document.querySelector('.jobs-search__job-details--container, .scaffold-layout__detail, .job-view-layout, main, .jobs-details') || document.body
        : document.body;

    const candidateSelectors = [
      '#jobDescriptionText',
      '.jobsearch-JobComponent',
      '.jobs-description__container',
      '.jobs-box__html-content',
      '#job-details',
      '.details-offer',
      '.box-offer',
      '[data-testid="job-description"]',
      '.offer-description',
      '[data-testid="job-offer-description"]',
      '[data-testid="job-content"]',
      'article',
    ];

    for (const sel of candidateSelectors) {
      const el = detailContainerRoot.querySelector(sel);
      if (el && el.innerText && el.innerText.trim().length > 50) {
        bodyContainerText = el.innerText.trim();
        break;
      }
    }

    if (!bodyContainerText) {
      if (detailContainerRoot !== document.body) {
        bodyContainerText = detailContainerRoot.innerText ? detailContainerRoot.innerText.slice(0, 4000) : '';
      } else if (!isSplitPage) {
        bodyContainerText = document.body ? document.body.innerText.slice(0, 4000) : '';
      }
    }
  }

  if (bodyContainerText) {
    bodyContainerText = bodyContainerText
      .replace(
        /\b(afficher plus|afficher moins|voir plus|voir moins|show more|show less|read more|signaler cette offre|report job)\b/gi,
        ''
      )
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  let finalTitle = domExtracted.titleRaw || '';
  if (!finalTitle && docTitle && !isSplitPage) {
    if (!/plus de \d+ (?:emplois|offres)/i.test(docTitle) && !/^Emplois?\s*:/i.test(docTitle)) {
      finalTitle = docTitle;
    }
  }

  if (domExtracted.location) {
    domExtracted.location = dedupeLocationString(domExtracted.location);
  }

  const syntheticHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${finalTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
        ${jsonLdHtml}
      </head>
      <body>
        <div class="job-container">
          ${bodyContainerText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
      </body>
    </html>
  `;

  return {
    url,
    title: finalTitle,
    rawText: `${finalTitle}\n${bodyContainerText.slice(0, 3000)}`,
    html: syntheticHtml,
    domExtracted,
  };
}

// 主提取流程
async function runExtraction() {
  showLoading();
  await initApiBase();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error('未获取到当前标签页');
    }

    if (
      tab.url?.startsWith('chrome://') ||
      tab.url?.startsWith('edge://') ||
      tab.url?.startsWith('about:')
    ) {
      throw new Error('无法在系统内部页面运行，请在求职网站页面上点击插件。');
    }

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageJobData,
    });

    if (!injectionResults || !injectionResults[0] || !injectionResults[0].result) {
      throw new Error('未能从页面提取到有效内容。');
    }

    const extracted = injectionResults[0].result;

    const res = await fetch(`${API_BASE}/api/parse-and-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extracted),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `服务端响应错误 (${res.status})，请确保 npm run dev 正在运行`);
    }

    const data = await res.json();
    currentParsedJob = data.parsedJob;
    currentDuplicates = data.duplicates || [];

    renderResult(currentParsedJob, currentDuplicates);
  } catch (err) {
    showError(err.message || '抓取解析出现异常');
  }
}

// 更新合同类型徽章样式
function updateContractBadge(type) {
  valContractEl.textContent = type || 'UNKNOWN';
  switch (type) {
    case 'CDI':
      valContractEl.className = 'badge badge-cdi';
      break;
    case 'CDD':
      valContractEl.className = 'badge badge-cdd';
      break;
    case 'FREELANCE':
      valContractEl.className = 'badge badge-freelance';
      break;
    case 'STAGE':
      valContractEl.className = 'badge badge-stage';
      break;
    case 'ALTERNANCE':
      valContractEl.className = 'badge badge-alternance';
      break;
    case 'UNKNOWN':
    default:
      valContractEl.className = 'badge badge-unknown';
      break;
  }
}

// 更新办公模式徽章样式
function updateWorkModeBadge(mode) {
  if (mode === 'ONSITE') {
    valWorkModeEl.style.display = 'inline-block';
    valWorkModeEl.textContent = '🏢 现场办公';
  } else if (mode === 'HYBRID') {
    valWorkModeEl.style.display = 'inline-block';
    valWorkModeEl.textContent = '🔄 混合办公';
  } else if (mode === 'REMOTE') {
    valWorkModeEl.style.display = 'inline-block';
    valWorkModeEl.textContent = '🏠 远程';
  } else {
    valWorkModeEl.style.display = 'none';
  }
}

// 评级图标映射（与选项一致）
const RATING_ICONS = {
  'S+': '🔥',
  'S': '💎',
  'A+': '🌟',
  'A': '✨',
  'A-': '⭐',
  'B': '🎯',
  'C': '💤',
};

// 更新星标 UI
function updateStarUI(starred) {
  isStarred = Boolean(starred);
  if (btnStarEl) {
    if (isStarred) {
      btnStarEl.classList.add('active');
      btnStarEl.title = '已设为特别关注 (点击取消)';
    } else {
      btnStarEl.classList.remove('active');
      btnStarEl.title = '设为特别关注 (星标)';
    }
  }
  if (jobCardEl) {
    if (isStarred) {
      jobCardEl.classList.add('card-starred');
    } else {
      jobCardEl.classList.remove('card-starred');
    }
  }
}

// 更新评级徽章
function updateRatingBadge(rating) {
  if (!valRatingEl) return;
  const r = rating || 'B';
  const icon = RATING_ICONS[r] || '🎯';
  valRatingEl.textContent = `${icon} 评级: ${r}`;
  if (r === 'S+' || r === 'S') {
    valRatingEl.style.background = 'rgba(239, 68, 68, 0.2)';
    valRatingEl.style.color = '#fca5a5';
    valRatingEl.style.borderColor = '#ef4444';
  } else if (r === 'A+' || r === 'A' || r === 'A-') {
    valRatingEl.style.background = 'rgba(245, 158, 11, 0.2)';
    valRatingEl.style.color = '#fcd34d';
    valRatingEl.style.borderColor = '#f59e0b';
  } else if (r === 'B') {
    valRatingEl.style.background = 'rgba(59, 130, 246, 0.2)';
    valRatingEl.style.color = '#93c5fd';
    valRatingEl.style.borderColor = '#3b82f6';
  } else {
    valRatingEl.style.background = 'rgba(148, 163, 184, 0.2)';
    valRatingEl.style.color = '#cbd5e1';
    valRatingEl.style.borderColor = '#64748b';
  }
}

// 更新初始状态徽章与保存按钮文字
function updateStatusUI(status) {
  if (valStatusBadgeEl) {
    if (status === 'SAVED') {
      valStatusBadgeEl.textContent = '📌 先保存未投';
      valStatusBadgeEl.style.background = 'rgba(245, 158, 11, 0.2)';
      valStatusBadgeEl.style.color = '#fbbf24';
      valStatusBadgeEl.style.borderColor = '#f59e0b';
      if (!btnSaveEl.disabled) btnSaveEl.textContent = '📌 确认保存为未投递';
    } else {
      valStatusBadgeEl.textContent = '🚀 已直接投递';
      valStatusBadgeEl.style.background = 'rgba(37, 99, 235, 0.2)';
      valStatusBadgeEl.style.color = '#60a5fa';
      valStatusBadgeEl.style.borderColor = '#2563eb';
      if (!btnSaveEl.disabled) btnSaveEl.textContent = '🚀 确认记录投递';
    }
  }
}

// 渲染结果
function renderResult(job, duplicates) {
  loadingEl.style.display = 'none';
  errorViewEl.style.display = 'none';
  successViewEl.style.display = 'none';
  mainViewEl.style.display = 'block';

  valPlatformEl.textContent = job.platform || 'OTHER';
  valIdEl.textContent = job.externalJobId ? `#${job.externalJobId}` : '';
  valCompanyEl.textContent = job.companyRaw || '未知公司';
  valTitleEl.textContent = job.titleRaw || '未知职位';

  // 1. 合同类型下拉框与徽章联动
  const initialContract = job.contractType || 'UNKNOWN';
  selectContractEl.value = initialContract;
  updateContractBadge(initialContract);

  // 2. 办公方式下拉框与徽章联动
  const initialWorkMode = job.workMode || '';
  selectWorkModeEl.value = initialWorkMode;
  updateWorkModeBadge(initialWorkMode);

  // 3. 评级、状态与星标复位
  updateStarUI(false);
  if (selectRatingEl) {
    selectRatingEl.value = 'B';
    updateRatingBadge('B');
  }
  if (selectStatusEl) {
    selectStatusEl.value = 'APPLIED';
    updateStatusUI('APPLIED');
  }

  // 4. 语言展示
  valLangEl.textContent = job.language === 'FR' ? '🇫🇷 FR' : '🇬🇧 EN';

  // 5. 工作地点输入框与展示联动 (纯地点，绝无工作模式后缀)
  valLocationEl.textContent = job.location || '地点未注明';
  inputLocationEl.value = job.location || '';

  // 6. 薪资输入框与展示联动
  valSalaryEl.textContent = job.salaryRange || '薪资面议';
  inputSalaryEl.value = job.salaryRange || '';

  // 7. 发布日期展示与输入框
  if (job.postedAt) {
    valPostedEl.style.display = 'inline-block';
    valPostedEl.textContent = `📅 ${job.postedAt}`;
    inputPostedEl.value = job.postedAt;
  } else {
    valPostedEl.style.display = 'none';
    inputPostedEl.value = '';
  }

  // ⚠️ 查重结果渲染
  if (duplicates && duplicates.length > 0) {
    warningSectionEl.style.display = 'block';
    warningCountTextEl.textContent = `检测到 ${duplicates.length} 条历史投递记录！`;

    dupListEl.innerHTML = duplicates
      .map(
        (d) => `
        <div class="dup-item">
          <div style="display: flex; justify-content: space-between; font-weight: 700; color: #fde047;">
            <span>[${d.level}] ${d.reason}</span>
            <span style="color: #94a3b8;">${d.matchedApplication?.applied_at?.slice(0, 10) || ''}</span>
          </div>
          <div style="color: #e2e8f0; margin-top: 2px;">
            ${d.matchedApplication?.company_raw} · ${d.matchedApplication?.title_raw}
          </div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 1px;">
            当前状态: <strong style="color: #cbd5e1;">${d.matchedApplication?.status || 'APPLIED'}</strong>
          </div>
        </div>
      `
      )
      .join('');

    chkForceEl.checked = false;
    btnSaveEl.disabled = true;
    btnSaveEl.textContent = '⚠️ 发现重复，已阻止提交';
  } else {
    warningSectionEl.style.display = 'none';
    chkForceEl.checked = true;
    btnSaveEl.disabled = false;
    const currentStatus = selectStatusEl?.value || 'APPLIED';
    btnSaveEl.textContent = currentStatus === 'SAVED' ? '📌 确认保存为未投递' : '🚀 确认记录投递';
  }
}

// 保存投递
async function saveApplication() {
  if (!currentParsedJob) return;

  btnSaveEl.disabled = true;
  btnSaveEl.textContent = '正在保存入库...';

  try {
    const chosenContract = selectContractEl.value || currentParsedJob.contractType || 'UNKNOWN';
    const chosenWorkMode = selectWorkModeEl.value || null;
    const chosenLocation = inputLocationEl.value.trim() || null;
    const chosenSalary = inputSalaryEl.value.trim() || null;
    const chosenPostedAt = inputPostedEl.value.trim() || null;
    const chosenRating = selectRatingEl?.value || 'B';
    const chosenStatus = selectStatusEl?.value || 'APPLIED';

    const payload = {
      ...currentParsedJob,
      contractType: chosenContract,
      workMode: chosenWorkMode,
      location: chosenLocation,
      salaryRange: chosenSalary,
      postedAt: chosenPostedAt,
      rating: chosenRating,
      is_starred: isStarred,
      status: chosenStatus,
      notes: inputNotesEl.value.trim() || null,
      hrContact: inputHrEl.value.trim() || null,
    };

    const res = await fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || '保存到数据库失败');
    }

    mainViewEl.style.display = 'none';
    successViewEl.style.display = 'block';
    successJobNameEl.textContent = `${currentParsedJob.companyRaw} · ${currentParsedJob.titleRaw}`;
  } catch (err) {
    alert(`保存失败: ${err.message}`);
    btnSaveEl.disabled = false;
    const currentStatus = selectStatusEl?.value || 'APPLIED';
    btnSaveEl.textContent = currentStatus === 'SAVED' ? '📌 确认保存为未投递' : '🚀 确认记录投递';
  }
}

// 辅助状态切换
function showLoading() {
  loadingEl.style.display = 'flex';
  mainViewEl.style.display = 'none';
  errorViewEl.style.display = 'none';
  successViewEl.style.display = 'none';
}

function showError(msg) {
  loadingEl.style.display = 'none';
  mainViewEl.style.display = 'none';
  successViewEl.style.display = 'none';
  errorViewEl.style.display = 'block';
  errorMsgEl.textContent = msg;
}

// 实时输入监听与微调同步
if (btnStarEl) {
  btnStarEl.addEventListener('click', () => {
    updateStarUI(!isStarred);
  });
}

if (selectRatingEl) {
  selectRatingEl.addEventListener('change', () => {
    updateRatingBadge(selectRatingEl.value);
  });
}

if (selectStatusEl) {
  selectStatusEl.addEventListener('change', () => {
    updateStatusUI(selectStatusEl.value);
  });
}

selectContractEl.addEventListener('change', () => {
  updateContractBadge(selectContractEl.value);
});

selectWorkModeEl.addEventListener('change', () => {
  updateWorkModeBadge(selectWorkModeEl.value);
});

inputLocationEl.addEventListener('input', () => {
  valLocationEl.textContent = inputLocationEl.value.trim() || '地点未注明';
});

inputSalaryEl.addEventListener('input', () => {
  valSalaryEl.textContent = inputSalaryEl.value.trim() || '薪资面议';
});

inputPostedEl.addEventListener('input', () => {
  const val = inputPostedEl.value.trim();
  if (val) {
    valPostedEl.style.display = 'inline-block';
    valPostedEl.textContent = `📅 ${val}`;
  } else {
    valPostedEl.style.display = 'none';
  }
});

// 事件监听
chkForceEl.addEventListener('change', () => {
  if (chkForceEl.checked) {
    btnSaveEl.disabled = false;
    btnSaveEl.textContent = '⚠️ 强制记录投递';
  } else {
    btnSaveEl.disabled = true;
    btnSaveEl.textContent = '⚠️ 发现重复，已阻止提交';
  }
});

btnSaveEl.addEventListener('click', saveApplication);
btnCloseEl.addEventListener('click', () => window.close());
btnRetryEl.addEventListener('click', runExtraction);
btnOpenBoardEl.addEventListener('click', () => {
  chrome.tabs.create({ url: API_BASE });
  window.close();
});

// 弹窗打开时立即执行
// 绑定设置面板交互事件（做空值保护，绝对不崩溃）
if (toggleSettingsEl && settingsPanelEl) {
  toggleSettingsEl.addEventListener('click', () => {
    settingsPanelEl.style.display = settingsPanelEl.style.display === 'none' ? 'block' : 'none';
  });
}

if (saveApiBtnEl && apiUrlInputEl) {
  saveApiBtnEl.addEventListener('click', () => {
    const cleanUrl = apiUrlInputEl.value.trim().replace(/\/+$/, '');
    chrome.storage.local.set({ custom_api_url: cleanUrl }, () => {
      alert(cleanUrl ? `✅ 已切换至线上后端: ${cleanUrl}` : '✅ 已恢复默认本地服务');
      settingsPanelEl.style.display = 'none';
      runExtraction();
    });
  });
}

if (resetApiBtnEl && apiUrlInputEl) {
  resetApiBtnEl.addEventListener('click', () => {
    chrome.storage.local.remove(['custom_api_url'], () => {
      alert('✅ 已恢复默认本地服务');
      apiUrlInputEl.value = '';
      settingsPanelEl.style.display = 'none';
      runExtraction();
    });
  });
}

document.addEventListener('DOMContentLoaded', runExtraction);
