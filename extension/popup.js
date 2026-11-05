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

  const isIndeed = /indeed\./i.test(url);
  const isLinkedIn = /linkedin\.com/i.test(url);
  const isApec = /apec\.fr/i.test(url);
  const isHelloWork = /hellowork\.com/i.test(url);

  // -------------------------------------------------------------
  // 1. Indeed 分栏与详情页专属提取 (解决 .../jobs?q=...&vjk=xxx 抓错问题)
  // -------------------------------------------------------------
  if (isIndeed) {
    const vjkMatch = url.match(/[?&](?:vjk|jk)=([a-zA-Z0-9]+)/i);
    const hasVjk = !!vjkMatch;
    const vjk = vjkMatch ? vjkMatch[1] : null;

    // 优先限定在右侧详情容器中查找
    const rightPane =
      document.querySelector('.jobsearch-RightPane') ||
      document.querySelector('.jobsearch-ViewJobLayout--embedded') ||
      document.querySelector('.jobsearch-JobComponent') ||
      document.querySelector('#jobsearch-ViewJobButtons-container')?.closest('.jobsearch-ViewJobLayout') ||
      document;

    // 职位标题严格取 [data-testid="jobsearch-JobInfoHeader-title"], h2.jobsearch-JobInfoHeader-title
    const titleEl = rightPane.querySelector(
      '[data-testid="jobsearch-JobInfoHeader-title"], h2.jobsearch-JobInfoHeader-title'
    );
    if (titleEl) {
      // 克隆节点并剔除内部的 "- job post" 等隐藏 span 文本
      const clone = titleEl.cloneNode(true);
      clone.querySelectorAll('.visually-hidden, span[aria-hidden="true"]').forEach((el) => el.remove());
      const cleanTitle = (clone.textContent || titleEl.innerText || '')
        .replace(/-?\s*job\s*post/gi, '')
        .trim();
      if (cleanTitle) {
        domExtracted.titleRaw = cleanTitle;
      }
    }

    // 公司名
    const companyEl = rightPane.querySelector(
      '[data-testid="inlineHeader-companyName"], .jobsearch-JobInfoHeader-companyName'
    );
    if (companyEl) {
      domExtracted.companyRaw = (companyEl.textContent || companyEl.innerText || '').trim();
    }

    // 城市 / 工作地点
    const locEl = rightPane.querySelector(
      '[data-testid="inlineHeader-companyLocation"], [data-testid="job-location"], [data-testid="jobsearch-JobInfoHeader-companyLocation"]'
    );
    if (locEl) {
      domExtracted.location = (locEl.textContent || locEl.innerText || '').trim();
    }

    // 发布日期
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
  // 2. LinkedIn 详情与分栏副标题提取 (解决城市与发布时间漏抓问题)
  // -------------------------------------------------------------
  if (isLinkedIn) {
    // 标题
    const liTitleEl = document.querySelector(
      '.job-details-jobs-unified-top-card__job-title, h1.t-24, .jobs-unified-top-card__job-title'
    );
    if (liTitleEl) {
      domExtracted.titleRaw = (liTitleEl.textContent || liTitleEl.innerText || '').trim();
    }

    // 公司
    const liCompEl = document.querySelector(
      '.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .topcard__org-name-link'
    );
    if (liCompEl) {
      domExtracted.companyRaw = (liCompEl.textContent || liCompEl.innerText || '').trim();
    }

    // 副标题描述区 (包含城市、发布时间和申请人数，用 · 分隔)
    const subContainer = document.querySelector(
      '.job-details-jobs-unified-top-card__primary-description-container, .job-details-jobs-unified-top-card__tertiary-description-container, .jobs-unified-top-card__primary-description, .job-details-jobs-unified-top-card__primary-description'
    );

    if (subContainer) {
      const fullText = (subContainer.innerText || subContainer.textContent || '').trim();
      const parts = fullText.split(/·|\n/).map((s) => s.trim()).filter(Boolean);

      // 第一个 · 之前是城市/地点
      if (parts.length > 0 && !domExtracted.location) {
        // 清理掉可能的 "由 xxx 发布" 等前缀
        const locCandidate = parts[0]
          .replace(/^(?:sur\s+place|hybride|a\s+distance|remote|temps\s+plein)\s*[-|•,]?\s*/i, '')
          .trim();
        domExtracted.location = locCandidate || parts[0];
      }

      // 查找包含时间特征词的片段
      for (const part of parts) {
        if (/前|时间|il y a|ago|heure|jour|semaine|mois|今天|hier|today|yesterday|reposted/i.test(part)) {
          // 清洗形如 "的时间: 1 周前" -> "1 周前"
          const cleanDate = part.replace(/^的时间:\s*/, '').trim();
          domExtracted.postedAt = cleanDate;
          break;
        }
      }
    }

    // 回退地点查找
    if (!domExtracted.location) {
      const tvmEl = document.querySelector('.tvm__text, .jobs-unified-top-card__bullet');
      if (tvmEl) {
        domExtracted.location = (tvmEl.textContent || tvmEl.innerText || '').trim();
      }
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

  // 构建传给服务端的标题：如果是 Indeed 搜索页且已提取到精准 titleRaw，绝不回退使用外层的 docTitle
  const finalTitle = domExtracted.titleRaw || docTitle;

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
