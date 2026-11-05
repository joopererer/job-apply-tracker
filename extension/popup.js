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

const inputHrEl = document.getElementById('input-hr');
const inputNotesEl = document.getElementById('input-notes');

const btnSaveEl = document.getElementById('btn-save');
const btnCloseEl = document.getElementById('btn-close');
const btnRetryEl = document.getElementById('btn-retry');
const btnOpenBoardEl = document.getElementById('btn-open-board');

// 注入当前活动标签页执行的 DOM 提取函数
function extractPageJobData() {
  const url = window.location.href;
  const title = document.title;

  // 1. 收集页面内所有 JSON-LD 标签内容
  const jsonLdElements = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
  );
  const jsonLdHtml = jsonLdElements
    .map((el) => `<script type="application/ld+json">${el.textContent || ''}</script>`)
    .join('\n');

  // 2. 针对五大平台详情容器的专属选择器
  const candidateSelectors = [
    // LinkedIn
    '.jobs-description__container',
    '.jobs-box__html-content',
    '.job-view-layout',
    '#job-details',
    // Indeed
    '#jobDescriptionText',
    '.jobsearch-JobComponent',
    '.jobsearch-jobDescriptionText',
    // Apec
    '.details-offer',
    '.box-offer',
    '.main-content',
    // HelloWork
    '[data-testid="job-description"]',
    '.offer-description',
    'section.content',
    // JobTeaser
    '[data-testid="job-offer-description"]',
    '.JobOfferDescription',
    // Welcome to the Jungle
    '[data-testid="job-content"]',
    // 通用备选
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

  // 3. 构建伪 HTML 文档，供 cheerio 优先解析 JSON-LD
  const syntheticHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
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
    title,
    rawText: `${title}\n${bodyContainerText.slice(0, 3000)}`,
    html: syntheticHtml,
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

