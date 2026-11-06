let API_BASE = 'http://localhost:3000';

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
const valWorkModeEl = document.getElementById('val-workmode');
const valLangEl = document.getElementById('val-lang');
const valLocationEl = document.getElementById('val-location');
const valSalaryEl = document.getElementById('val-salary');
const valPostedEl = document.getElementById('val-posted');

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
    const matchShort = text.match(/(\d{2,3}(?:[.,]\d+)?\s*[kK]?\s*€?\s*(?:-|~|à|to)\s*\d{2,3}(?:[.,]\d+)?\s*[kK]\s*€?)/i);
    if (matchShort && matchShort[1]) return matchShort[1].trim();
    const matchFull = text.match(/(\d{2,3}(?:\s?\d{3})?\s*€\s*(?:-|~|à|to)\s*\d{2,3}(?:\s?\d{3})?\s*€)/i);
    if (matchFull && matchFull[1]) return matchFull[1].trim();
    return null;
  }

  function extractContractType(text) {
    if (!text || typeof text !== 'string') return 'UNKNOWN';
    const norm = stripDiacritics(text).toLowerCase();
    if (/(?:\b(?:cdi|permanent|indefinite|full[- ]?time|temps\s+plein)\b|全职|无固定期限)/i.test(norm) || /duree\s+indeterminee/i.test(norm)) return 'CDI';
    if (/(?:\b(?:cdd|fixed[- ]?term|temporary|interim)\b|短期|合同工|固定期限)/i.test(norm) || /duree\s+determinee/i.test(norm)) return 'CDD';
    if (/(?:\b(?:freelance|independant|tjm|auto[- ]?entrepreneur)\b|自由职业)/i.test(norm)) return 'FREELANCE';
    if (/(?:\b(?:alternance|apprentissage|contrat\s+pro)\b)/i.test(norm)) return 'ALTERNANCE';
    if (/(?:\b(?:stage|internship|stagiaire)\b|实习)/i.test(norm)) return 'STAGE';
    return 'UNKNOWN';
  }

  function extractWorkMode(text) {
    if (!text || typeof text !== 'string') return null;
    const norm = stripDiacritics(text).toLowerCase();
    if (/(?:\b(?:hybride|hybrid|teletravail\s+partiel)\b|混合办公)/i.test(norm)) return 'HYBRID';
    if (/(?:\b(?:sur\s+site|sur\s+place|presentiel|on[- ]?site)\b|现场办公|坐班)/i.test(norm)) return 'ONSITE';
    if (/(?:\b(?:teletravail\s+complet|full[- ]?remote|100%\s*remote|teletravail|remote)\b|远程办公|远程)/i.test(norm)) return 'REMOTE';
    return null;
  }

  function parsePostedDate(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const text = raw.trim();
    if (!text) return null;
    const now = new Date();
    const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch && !isNaN(new Date(text).getTime())) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

    const frDateMatch = text.match(/(?:publi[eé]e?\s*(?:le)?\s*:?\s*)?(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/i);
    if (frDateMatch) return `${frDateMatch[3]}-${frDateMatch[2].padStart(2, '0')}-${frDateMatch[1].padStart(2, '0')}`;

    const lower = stripDiacritics(text).toLowerCase();
    if (/^(aujourd'hui|aujourdhui|today|刚刚|今天|just posted)$/i.test(lower)) return toIso(now);
    if (/^(hier|yesterday|昨天)$/i.test(lower)) { const d = new Date(now); d.setDate(d.getDate() - 1); return toIso(d); }
    return null;
  }

  const isIndeed = /indeed\./i.test(url);
  const isLinkedIn = /linkedin\.com/i.test(url);
  const isApec = /apec\.fr/i.test(url);
  const isHelloWork = /hellowork\.com/i.test(url);

  if (isLinkedIn) {
    const liIdMatch = url.match(/\/jobs\/view\/(\d+)/i) || url.match(/[?&]currentJobId=(\d+)/i);
    if (liIdMatch) {
      domExtracted.externalJobId = liIdMatch[1];
      domExtracted.cleanUrl = `https://www.linkedin.com/jobs/view/${liIdMatch[1]}`;
    }
    const cleanDocTitle = (docTitle || document.title || '').replace(/^\(\d+\)\s*/, '').trim();
    const parts = cleanDocTitle.split(/\s*\|\s*/);
    if (parts.length >= 3) {
      domExtracted.titleRaw = parts[0].trim();
      domExtracted.companyRaw = parts[1].trim();
    }
  }

  if (isIndeed) {
    const vjkMatch = url.match(/[?&](?:vjk|jk)=([a-zA-Z0-9]+)/i);
    if (vjkMatch) {
      domExtracted.externalJobId = vjkMatch[1];
      domExtracted.cleanUrl = `https://fr.indeed.com/viewjob?jk=${vjkMatch[1]}`;
    }
  }

  return {
    url,
    title: docTitle,
    rawText: (document.querySelector('main') || document.body).innerText.slice(0, 3000),
    html: document.documentElement.outerHTML,
    domExtracted,
  };
}

async function runExtraction() {
  showLoading();
  await initApiBase();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) throw new Error('未获取到当前标签页');

    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:')) {
      throw new Error('无法在系统内部页面运行（如 chrome://），请在任意求职网站（如 LinkedIn、Indeed）页面上点击插件。');
    }

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageJobData,
    });

    if (!injectionResults || !injectionResults[0] || !injectionResults[0].result) {
      throw new Error('未能从页面提取到有效内容。');
    }

    const res = await fetch(`${API_BASE}/api/parse-and-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(injectionResults[0].result),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `服务端响应错误 (${res.status})`);
    }

    const data = await res.json();
    currentParsedJob = data.parsedJob;
    currentDuplicates = data.duplicates || [];
    renderResult(currentParsedJob, currentDuplicates);
  } catch (err) {
    showError(err.message || '抓取解析出现异常');
  }
}

function updateContractBadge(type) {
  valContractEl.textContent = type || 'UNKNOWN';
}

function updateWorkModeBadge(mode) {
  if (mode) {
    valWorkModeEl.style.display = 'inline-block';
    valWorkModeEl.textContent = mode;
  } else {
    valWorkModeEl.style.display = 'none';
  }
}

function renderResult(job, duplicates) {
  loadingEl.style.display = 'none';
  errorViewEl.style.display = 'none';
  successViewEl.style.display = 'none';
  mainViewEl.style.display = 'block';

  valPlatformEl.textContent = job.platform || 'OTHER';
  valCompanyEl.textContent = job.companyRaw || '未知公司';
  valTitleEl.textContent = job.titleRaw || '未知职位';
  selectContractEl.value = job.contractType || 'UNKNOWN';
  valLocationEl.textContent = job.location || '地点未注明';
  inputLocationEl.value = job.location || '';
  valSalaryEl.textContent = job.salaryRange || '薪资面议';
  inputSalaryEl.value = job.salaryRange || '';
}

async function saveApplication() {
  if (!currentParsedJob) return;
  btnSaveEl.disabled = true;
  btnSaveEl.textContent = '正在保存入库...';

  try {
    const payload = {
      ...currentParsedJob,
      contractType: selectContractEl.value,
      location: inputLocationEl.value.trim() || null,
      salaryRange: inputSalaryEl.value.trim() || null,
      status: 'APPLIED',
    };

    const res = await fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('保存到数据库失败');

    mainViewEl.style.display = 'none';
    successViewEl.style.display = 'block';
    successJobNameEl.textContent = `${currentParsedJob.companyRaw} · ${currentParsedJob.titleRaw}`;
  } catch (err) {
    alert(`保存失败: ${err.message}`);
    btnSaveEl.disabled = false;
    btnSaveEl.textContent = '✨ 确认记录投递';
  }
}

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

if (btnSaveEl) btnSaveEl.addEventListener('click', saveApplication);
if (btnCloseEl) btnCloseEl.addEventListener('click', () => window.close());
if (btnRetryEl) btnRetryEl.addEventListener('click', runExtraction);
if (btnOpenBoardEl) {
  btnOpenBoardEl.addEventListener('click', () => {
    chrome.tabs.create({ url: API_BASE });
    window.close();
  });
}

document.addEventListener('DOMContentLoaded', runExtraction);