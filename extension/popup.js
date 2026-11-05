const API_BASE = 'http://localhost:3000';

let currentParsedJob = null;
let currentDuplicates = [];

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

const valPlatformEl = document.getElementById('val-platform');
const valIdEl = document.getElementById('val-id');
const valCompanyEl = document.getElementById('val-company');
const valTitleEl = document.getElementById('val-title');
const valContractEl = document.getElementById('val-contract');
const valLangEl = document.getElementById('val-lang');
const valLocationEl = document.getElementById('val-location');
const valSalaryEl = document.getElementById('val-salary');
const valPostedEl = document.getElementById('val-posted');

const inputPostedEl = document.getElementById('input-posted');
const inputHrEl = document.getElementById('input-hr');
const inputNotesEl = document.getElementById('input-notes');

const btnSaveEl = document.getElementById('btn-save');
const btnCloseEl = document.getElementById('btn-close');
const btnRetryEl = document.getElementById('btn-retry');
const btnOpenBoardEl = document.getElementById('btn-open-board');

// 注入当前活动标签页执行的 DOM 提取函数
function extractPageJobData() {
  const url = window.location.href;
  const docTitle = document.title;
  const domExtracted = {};

  function isLikelyLocation(str) {
    if (!str) return false;
    const s = str.trim();
    if (/\(\s*\d{2,5}\s*\)/.test(s)) return true;
    if (/^\d{5}\b/.test(s) || /\b\d{5}$/.test(s)) return true;
    if (
      /\b(paris|lyon|marseille|toulouse|bordeaux|nantes|lille|strasbourg|rennes|montpellier|nice|grenoble|annecy|rouen|toulon|angers|dijon|brest|le mans|reims|france|teletravail|remote|ile-de-france|auvergne|rhone-alpes|paca)\b/i.test(
        s
      )
    ) {
      return true;
    }
    if (
      /(?:法国|巴黎|里昂|马赛|图卢兹|波尔多|南特|里尔|斯特拉斯堡|雷恩|蒙彼利埃|尼斯|格勒诺布尔|阿纳西|远程)/.test(
        s
      )
    ) {
      return true;
    }
    return false;
  }

  const isIndeed = /indeed\./i.test(url);
  const isLinkedIn = /linkedin\.com/i.test(url);
  const isApec = /apec\.fr/i.test(url);
  const isHelloWork = /hellowork\.com/i.test(url);

  // -------------------------------------------------------------
  // 1. Indeed 分栏与详情页专属提取 (解决 .../jobs?q=...&vjk=xxx 抓错问题与地址公司名混淆)
  // -------------------------------------------------------------
  if (isIndeed) {
    const vjkMatch = url.match(/[?&](?:vjk|jk)=([a-zA-Z0-9]+)/i);
    const hasVjk = !!vjkMatch;
    const vjk = vjkMatch ? vjkMatch[1] : null;

    // 选中的左侧卡片（在 jobs?q=...&vjk=... 页面中始终存在）
    let cardEl = null;
    if (vjk) {
      cardEl =
        document.querySelector(`[data-jk="${vjk}"]`)?.closest('li, .job_seen_beacon, .result, .slider_item') ||
        document.querySelector(`[data-jk="${vjk}"]`);
    }

    // 右侧详情面板容器
    const rightPane =
      document.querySelector('#jobsearch-ViewjobPaneWrapper') ||
      document.querySelector('.jobsearch-RightPane') ||
      document.querySelector('#vjs-container') ||
      document.querySelector('.jobsearch-ViewJobLayout--embedded') ||
      document.querySelector('.jobsearch-JobComponent') ||
      document.querySelector('#viewJobSSRRoot') ||
      document.querySelector('[data-testid="jobsearch-ViewjobPaneWrapper"]') ||
      document;

    // A. 职位标题
    const titleEl = rightPane.querySelector(
      '[data-testid="jobsearch-JobInfoHeader-title"], h1[class*="JobInfoHeader-title"], h2[class*="JobInfoHeader-title"], [data-testid="simpler-job-title"], .jobsearch-JobInfoHeader-title, h1'
    );
    if (titleEl) {
      const clone = titleEl.cloneNode(true);
      clone.querySelectorAll('.visually-hidden, span[aria-hidden="true"]').forEach((el) => el.remove());
      const cleanTitle = (clone.textContent || titleEl.innerText || '')
        .replace(/-?\s*job\s*post/gi, '')
        .trim();
      if (cleanTitle && !/plus de \d+ (?:emplois|offres)/i.test(cleanTitle) && !cleanTitle.startsWith('Emplois')) {
        domExtracted.titleRaw = cleanTitle;
      }
    }
    // 若未抓到标题且有选中的卡片，从左侧卡片回退
    if (!domExtracted.titleRaw && cardEl) {
      const cardTitleEl = cardEl.querySelector(
        'h2.jobTitle span[title], h2.jobTitle a, h2.jobTitle, [data-testid="jobTitle"], a[data-jk]'
      );
      if (cardTitleEl) {
        const clone = cardTitleEl.cloneNode(true);
        clone.querySelectorAll('.visually-hidden').forEach((el) => el.remove());
        const cardTitle = (clone.getAttribute('title') || clone.textContent || '').trim();
        if (cardTitle) domExtracted.titleRaw = cardTitle;
      }
    }

    // B. 公司名
    const companySelectors = [
      'div[data-company-name="true"]',
      '[data-testid="inlineHeader-companyName"]',
      '[data-testid="jobsearch-JobInfoHeader-companyName"]',
      '[data-testid="jobsearch-CompanyInfoContainer"] a',
      '[data-testid="jobsearch-CompanyInfoContainer"] span',
      '.jobsearch-CompanyInfoContainer a',
      '.jobsearch-CompanyInfoContainer',
      '[data-testid="company-name"]',
      'a[href*="/cmp/"]',
      'div[class*="CompanyInfoContainer"] a',
      'div[class*="CompanyInfoContainer"] span',
      'span[class*="companyName"]',
      'div[class*="companyName"]',
    ];
    for (const sel of companySelectors) {
      const compEl = rightPane.querySelector(sel);
      if (compEl) {
        const text = (compEl.textContent || compEl.innerText || '').trim();
        // 绝不能把 "Paris (75)" 当成公司名
        if (text && !isLikelyLocation(text)) {
          domExtracted.companyRaw = text;
          break;
        }
      }
    }
    // 若未抓到公司名，从左侧卡片回退
    if (!domExtracted.companyRaw && cardEl) {
      const cardCompEl = cardEl.querySelector(
        '[data-testid="company-name"], span.companyName, span[class*="companyName"], a[data-testid="company-name"], a[href*="/cmp/"]'
      );
      if (cardCompEl) {
        const text = (cardCompEl.textContent || cardCompEl.innerText || '').trim();
        if (text && !isLikelyLocation(text)) {
          domExtracted.companyRaw = text;
        }
      }
    }

    // C. 城市 / 工作地点
    const locationSelectors = [
      '[data-testid="inlineHeader-companyLocation"]',
      '[data-testid="jobsearch-JobInfoHeader-companyLocation"]',
      '[data-testid="job-location"]',
      'div[data-testid="jobsearch-CompanyInfoContainer"] + div',
      'div[class*="companyLocation"]',
      'div[class*="CompanyLocation"]',
      '#jobLocationText',
    ];
    for (const sel of locationSelectors) {
      const locEl = rightPane.querySelector(sel);
      if (locEl) {
        const text = (locEl.textContent || locEl.innerText || '').trim();
        if (text) {
          domExtracted.location = text;
          break;
        }
      }
    }
    // 若未抓到地点，从左侧卡片回退
    if (!domExtracted.location && cardEl) {
      const cardLocEl = cardEl.querySelector(
        '[data-testid="text-location"], div.companyLocation, div[class*="companyLocation"]'
      );
      if (cardLocEl) {
        const text = (cardLocEl.textContent || cardLocEl.innerText || '').trim();
        if (text) domExtracted.location = text;
      }
    }

    // D. 发布日期
    const dateEl = rightPane.querySelector(
      '[data-testid="myJobsStateDate"], .jobsearch-JobMetadataFooter, [data-testid="hiring-insights"]'
    );
    if (dateEl) {
      const dateText = (dateEl.innerText || dateEl.textContent || '').trim();
      const match = dateText.match(
        /(?:publi[eé]e?\s+)?(?:il\s+y\s+a\s+[\w\s\+]+|just posted|today|hier|\d+\+?\s*(?:jours?|days?)\s*(?:ago)?)/i
      );
      if (match) {
        domExtracted.postedAt = match[0].trim();
      }
    }

    if (hasVjk && vjk) {
      domExtracted.externalJobId = vjk;
      domExtracted.cleanUrl = `https://fr.indeed.com/viewjob?jk=${vjk}`;
    }
  }

  // -------------------------------------------------------------
  // 2. LinkedIn 详情与分栏副标题提取 (三重保底策略，彻底解决中文地址漏抓)
  // -------------------------------------------------------------
  if (isLinkedIn) {
    // 寻找标题节点
    const titleEl =
      document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, .top-card-layout__title, h1') ||
      document.querySelector('h1');
    if (titleEl) {
      domExtracted.titleRaw = (titleEl.textContent || titleEl.innerText || '').trim();
    }

    // 基于 H1 向上查找顶级卡片容器 (Top Card)
    const topCard =
      titleEl?.closest('.job-details-jobs-unified-top-card__container--two-pane, .job-details-jobs-unified-top-card, .jobs-unified-top-card, .top-card-layout, .jobs-search__job-details--container, main') ||
      document.querySelector('.job-details-jobs-unified-top-card, .jobs-unified-top-card, .top-card-layout') ||
      document.body;

    // 提取公司名
    const liCompEl = topCard.querySelector(
      '.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .topcard__org-name-link, a[href*="/company/"], .topcard__flavor:not(.topcard__flavor--bullet)'
    );
    if (liCompEl) {
      domExtracted.companyRaw = (liCompEl.textContent || liCompEl.innerText || '').trim();
    }

    let locationCandidate = '';
    let postedAtCandidate = '';
    let workplaceTypeCandidate = '';

    // -------------------------------------------------------------
    // 策略 A：基于 Top Card 特征容器与包含中圆点行全面扫描
    // -------------------------------------------------------------
    const descContainers = Array.from(
      topCard.querySelectorAll(
        '.job-details-jobs-unified-top-card__primary-description-container, .job-details-jobs-unified-top-card__primary-description, .jobs-unified-top-card__primary-description, .topcard__flavor-row, div.t-black--light, h1 ~ div, h1 ~ p, span.jobs-unified-top-card__subtitle-primary-grouping, span.tvm__text'
      )
    );

    // 如果未找到上述特定类名的容器，扫描包含中圆点且包含时间/申请人特征词的文本行
    if (descContainers.length === 0) {
      const allTextNodes = Array.from(topCard.querySelectorAll('div, p, span'));
      for (const el of allTextNodes) {
        const txt = el.innerText || el.textContent || '';
        if (
          /[·•・‧⋅]/.test(txt) &&
          /(?:前|时间|申请|候选|il\s+y\s+a|ago|candidat|applicant|reposted|发布)/i.test(txt) &&
          txt.length < 300
        ) {
          descContainers.push(el);
        }
      }
    }

    // 逐个容器拆分解析（支持所有 Unicode bullet 符号与换行符）
    for (const container of descContainers) {
      const fullText = (container.innerText || container.textContent || '').trim();
      if (!fullText) continue;

      const parts = fullText
        .split(/\s*[·•・‧⋅|\n]+\s*/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const part of parts) {
        // 1. 识别发布时间 (如 "的时间: 1 周前", "1 周前", "il y a 3 jours", "2 days ago")
        if (
          !postedAtCandidate &&
          /(?:前|时间|il\s+y\s+a|ago|heure|jour|semaine|mois|今天|hier|today|yesterday|reposted|发布)/i.test(part)
        ) {
          const cleanDate = part
            .replace(/^(?:的时间|发布于|publi[eé]e?\s*(?:le)?)\s*:?\s*/i, '')
            .trim();
          postedAtCandidate = cleanDate;
          continue;
        }

        // 2. 识别工作模式（中文不带 \\b，英文带 \\b）
        const wpMatch = part.match(
          /(?:现场办公|混合办公|远程办公|远程|全职|兼职|\b(?:sur\s+site|sur\s+place|hybride|t[eé]l[eé]travail|remote|on-site|hybrid|full-time|part-time)\b)/i
        );
        if (wpMatch && !workplaceTypeCandidate) {
          workplaceTypeCandidate = wpMatch[0].trim();
        }

        // 3. 过滤干扰项：申请人数、推广、洞察、响应率等
        if (
          /(?:位?申请|candidat|applicant|推广|promoted|洞察|insight|响应|reponse|sponsor)/i.test(part) ||
          /^(?:现场办公|混合办公|远程办公|远程|全职|兼职|sur\s+site|sur\s+place|hybride|t[eé]l[eé]travail|remote|on-site|hybrid|full-time)$/i.test(part)
        ) {
          continue;
        }

        // 4. 过滤与公司名相同（或仅包含公司名）的项
        if (
          domExtracted.companyRaw &&
          (part.toLowerCase() === domExtracted.companyRaw.toLowerCase() ||
           part.toLowerCase().includes(domExtracted.companyRaw.toLowerCase()))
        ) {
          continue;
        }

        // 5. 提取工作地点：第一个非空的有效非噪音片段即为地点！
        if (!locationCandidate && part.length >= 2) {
          const cleanedPart = part
            .replace(/^(?:sur\s+place|hybride|a\s+distance|remote|temps\s+plein)\s*[-|•,]?\s*/i, '')
            .replace(/^(?:由[^\s]+(?:推广|发布)\s*)/i, '')
            .trim();

          if (cleanedPart && cleanedPart.length >= 2) {
            locationCandidate = cleanedPart;
          }
        }
      }
    }

    // -------------------------------------------------------------
    // 策略 C：扫描 Top Card 按钮/标签区的工作模式 (如 "现场办公", "全职")
    // -------------------------------------------------------------
    if (!workplaceTypeCandidate) {
      const insightPills = Array.from(
        topCard.querySelectorAll(
          '.job-details-jobs-unified-top-card__job-insight, .jobs-unified-top-card__job-insight, button, .ui-label, .artdeco-pill, span[class*="workplace-type"]'
        )
      );
      for (const pill of insightPills) {
        const text = (pill.innerText || pill.textContent || '').trim();
        const m = text.match(
          /(?:现场办公|混合办公|远程办公|远程|\b(?:Sur\s+site|Sur\s+place|Hybride|Télétravail|On-site|Hybrid|Remote)\b)/i
        );
        if (m) {
          workplaceTypeCandidate = m[0].trim();
          break;
        }
      }
    }

    // -------------------------------------------------------------
    // 策略 B：从网页 document.title 兜底提取地点
    // -------------------------------------------------------------
    if (!locationCandidate && docTitle) {
      // 1. 中文网页标题: "... 正在 <地点> 招聘 ..."
      const zhTitleMatch = docTitle.match(/正在\s+([^|—–]+?)\s*招聘/);
      if (zhTitleMatch && zhTitleMatch[1]) {
        locationCandidate = zhTitleMatch[1].trim();
      }

      // 2. 英文网页标题: "... in <Location> | LinkedIn"
      if (!locationCandidate) {
        const inMatch = docTitle.match(/\bin\s+([^|—–]+?)\s*(?:\||—|–|$)/i);
        if (inMatch && inMatch[1] && !/linkedin/i.test(inMatch[1])) {
          locationCandidate = inMatch[1].trim();
        }
      }

      // 3. 法文网页标题: "... à <Location> | LinkedIn"
      if (!locationCandidate) {
        const aMatch = docTitle.match(/\b(?:à|a)\s+([^|—–]+?)\s*(?:\||—|–|$)/i);
        if (aMatch && aMatch[1] && !/linkedin/i.test(aMatch[1])) {
          locationCandidate = aMatch[1].trim();
        }
      }

      // 4. 破折号标题: "... — <Location> | LinkedIn Jobs"
      if (!locationCandidate && (docTitle.includes(' — ') || docTitle.includes(' – '))) {
        const dashParts = docTitle.split(/[—–]/);
        if (dashParts.length > 1) {
          const loc = dashParts[1].split(/\|/)[0].trim();
          if (loc && !/linkedin/i.test(loc)) {
            locationCandidate = loc;
          }
        }
      }
    }

    // 组装最终地点与工作模式
    if (locationCandidate) {
      if (workplaceTypeCandidate && !locationCandidate.includes(workplaceTypeCandidate)) {
        domExtracted.location = `${locationCandidate} (${workplaceTypeCandidate})`;
      } else {
        domExtracted.location = locationCandidate;
      }
    } else if (workplaceTypeCandidate) {
      domExtracted.location = workplaceTypeCandidate;
    }

    // 补充发布时间
    if (postedAtCandidate && !domExtracted.postedAt) {
      domExtracted.postedAt = postedAtCandidate;
    }
  }

  // -------------------------------------------------------------
  // 3. Apec 专属发布时间与字段补充
  // -------------------------------------------------------------
  if (isApec) {
    const apecDateEl = document.querySelector('.date-publication, .card-offer__date');
    if (apecDateEl) {
      domExtracted.postedAt = (apecDateEl.textContent || apecDateEl.innerText || '').trim();
    }
  }

  // -------------------------------------------------------------
  // 4. HelloWork 专属发布时间补充
  // -------------------------------------------------------------
  if (isHelloWork) {
    const hwDateEl = document.querySelector('[data-testid="job-meta-date"], .offer-header-date');
    if (hwDateEl) {
      domExtracted.postedAt = (hwDateEl.textContent || hwDateEl.innerText || '').trim();
    }
  }

  // -------------------------------------------------------------
  // 5. 收集 JSON-LD 标签内容 (Indeed 带 vjk 时忽略外层搜索列表 JSON-LD)
  // -------------------------------------------------------------
  let jsonLdHtml = '';
  const isIndeedSearchWithVjk = isIndeed && url.includes('vjk=');
  if (!isIndeedSearchWithVjk) {
    const jsonLdElements = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );
    jsonLdHtml = jsonLdElements
      .map((el) => `<script type="application/ld+json">${el.textContent || ''}</script>`)
      .join('\n');
  }

  // 6. 详情正文容器提取
  const candidateSelectors = [
    // Indeed 右侧
    '.jobsearch-RightPane #jobDescriptionText',
    '#jobDescriptionText',
    '.jobsearch-JobComponent',
    // LinkedIn
    '.jobs-description__container',
    '.jobs-box__html-content',
    '.job-view-layout',
    '#job-details',
    // Apec
    '.details-offer',
    '.box-offer',
    // HelloWork
    '[data-testid="job-description"]',
    '.offer-description',
    // JobTeaser
    '[data-testid="job-offer-description"]',
    // WTTJ
    '[data-testid="job-content"]',
    'article',
    'main',
  ];

  let bodyContainerText = '';
  for (const sel of candidateSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText && el.innerText.trim().length > 80) {
      bodyContainerText = el.innerText.trim();
      break;
    }
  }

  if (!bodyContainerText) {
    bodyContainerText = document.body ? document.body.innerText.slice(0, 4000) : '';
  }

  // 基础噪音过滤
  if (bodyContainerText) {
    bodyContainerText = bodyContainerText
      .replace(
        /\b(afficher plus|afficher moins|voir plus|voir moins|show more|show less|read more|signaler cette offre|report job)\b/gi,
        ''
      )
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // 构建传给服务端的标题：如果是 Indeed 搜索页且未提取到精准 titleRaw，绝不回退使用外层的 docTitle
  let finalTitle = domExtracted.titleRaw || '';
  if (!finalTitle && docTitle) {
    if (!/plus de \d+ (?:emplois|offres)/i.test(docTitle) && !/^Emplois?\s*:/i.test(docTitle)) {
      finalTitle = docTitle;
    }
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

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error('未获取到当前标签页');
    }

    // 检查是否为不可注入脚本的受限页面 (chrome://, edge://, about: 等)
    if (
      tab.url?.startsWith('chrome://') ||
      tab.url?.startsWith('edge://') ||
      tab.url?.startsWith('about:')
    ) {
      throw new Error('无法在系统内部页面运行，请在求职网站页面上点击插件。');
    }

    // 在页面中执行提取
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageJobData,
    });

    if (!injectionResults || !injectionResults[0] || !injectionResults[0].result) {
      throw new Error('未能从页面提取到有效内容。');
    }

    const extracted = injectionResults[0].result;

    // 发送到本地或远程 API 进行解析与查重
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

  valContractEl.textContent = job.contractType || 'CDI';
  if (job.contractType === 'CDD') {
    valContractEl.className = 'badge badge-cdd';
  } else {
    valContractEl.className = 'badge badge-cdi';
  }

  valLangEl.textContent = job.language === 'FR' ? '🇫🇷 FR' : '🇬🇧 EN';
  valLocationEl.textContent = job.location || '地点未注明';
  valSalaryEl.textContent = job.salaryRange || '薪资面议';

  // 渲染发布日期
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

    // 默认禁止保存，除非勾选强制记录
    chkForceEl.checked = false;
    btnSaveEl.disabled = true;
    btnSaveEl.textContent = '⚠️ 发现重复，已阻止提交';
  } else {
    warningSectionEl.style.display = 'none';
    chkForceEl.checked = true;
    btnSaveEl.disabled = false;
    btnSaveEl.textContent = '✨ 确认记录投递';
  }
}

// 保存投递
async function saveApplication() {
  if (!currentParsedJob) return;

  btnSaveEl.disabled = true;
  btnSaveEl.textContent = '正在保存入库...';

  try {
    const payload = {
      ...currentParsedJob,
      postedAt: inputPostedEl.value.trim() || currentParsedJob.postedAt || null,
      status: 'APPLIED',
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

    // 展示成功状态
    mainViewEl.style.display = 'none';
    successViewEl.style.display = 'block';
    successJobNameEl.textContent = `${currentParsedJob.companyRaw} · ${currentParsedJob.titleRaw}`;
  } catch (err) {
    alert(`保存失败: ${err.message}`);
    btnSaveEl.disabled = false;
    btnSaveEl.textContent = '✨ 确认记录投递';
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
document.addEventListener('DOMContentLoaded', runExtraction);
