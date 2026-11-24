let API_BASE = 'http://localhost:3000';
let currentLang = 'zh';

// 国际化多语言字典 (FR / EN / ZH)
const I18N_EXTENSION = {
  zh: {
    userStatusLogin: '👤 登录账号',
    userStatusTitle: '点击登录账号',
    currentAccount: '当前已登录账号',
    openBoard: '📊 打开求职看板',
    logout: '退出登录',
    loggedOutNotice: '您已安全退出当前账号',
    loginTitle: '登录求职追踪账号',
    loginDesc: '登录后投递数据将安全隔离同步至您的专属求职看板。',
    emailLabel: '账号邮箱',
    passwordLabel: '登录密码',
    loginBtn: '登录并继续',
    loggingIn: '登录中...',
    inputEmailPassword: '请输入邮箱和密码',
    loginFailed: '登录失败，请检查账号密码',
    loginError: '登录异常',
    noAccount: '还没有账号？',
    registerWeb: '去网页端注册 →',
    loadingTitle: '正在尝试解析当前网页...',
    loadingSubtitle: '秒级 DOM 提取 · 结构化解析 · 实时防重核对',
    extractError: '未能提取当前页面职位信息',
    btnRetry: '重新抓取',
    successTitle: '职位记录已成功入库！',
    btnOpenBoard: '打开看板查看',
    warnDupTitle: '检测到高危重复投递！',
    warnDupCount: (n) => `检测到 ${n} 条历史投递记录！`,
    chkForce: '确认不同岗位，允许强制记录',
    btnForceSave: '⚠️ 强制记录投递',
    btnBlockedSave: '⚠️ 发现重复，已阻止提交',
    starTitle: '设为特别关注 (星标)',
    starActiveTitle: '已设为特别关注 (点击取消)',
    unknownCompany: '未知公司',
    unknownTitle: '未知职位',
    noLocation: '地点未注明',
    salaryNegotiable: '薪资面议',
    salaryNotSpecified: '薪资未注明',
    labelRating: '岗位评级 (Rating)',
    labelStatus: '初始状态 (Initial Status)',
    labelContract: '合同类型 (Contract)',
    labelWorkMode: '办公方式 (Work Mode)',
    labelLocation: '工作地点 (Location)',
    labelSalary: '薪资范围 (Salary)',
    labelPosted: '发布日期 (Posted)',
    labelHr: 'HR 联系方式 (姓名/电话)',
    labelNotes: '投递备注笔记',
    placeholderLocation: '如: Paris (75)',
    placeholderSalary: '如: 45k - 55k € 或面议',
    placeholderPosted: '如: 2026-10-25',
    placeholderHr: '如: 06 12 34 56 78 或 Marie',
    placeholderNotes: '如: 投递版本、内推码等...',
    ratingSPlus: '🔥 S+ (顶级心仪/必投)',
    ratingS: '💎 S (重点目标)',
    ratingAPlus: '🌟 A+ (优质岗位)',
    ratingA: '✨ A (良好机会)',
    ratingAMinus: '⭐ A- (合格/可投)',
    ratingB: '🎯 B (基准/海投默认)',
    ratingC: '💤 C (保底/观望)',
    optionStatusApplied: '🚀 已直接投递 (Applied)',
    optionStatusSaved: '📌 先保存未投 (Saved)',
    optionContractCdi: 'CDI (长期合同)',
    optionContractCdd: 'CDD (定期合同)',
    optionContractFreelance: 'FREELANCE (自由职业)',
    optionContractStage: 'STAGE (实习)',
    optionContractAlternance: 'ALTERNANCE (学徒工)',
    optionContractUnknown: 'UNKNOWN (待定/未知)',
    optionWorkModeNone: '未注明 / 默认',
    optionWorkModeOnsite: '🏢 现场办公 (On-site)',
    optionWorkModeHybrid: '🔄 混合办公 (Hybrid)',
    optionWorkModeRemote: '🏠 远程办公 (Remote)',
    btnSave: '🚀 确认记录投递',
    btnSaveSaved: '📌 确认保存为未投递',
    btnClose: '关闭弹窗',
    saving: '正在保存入库...',
    statusApplied: '🚀 已直接投递',
    statusSaved: '📌 先保存未投',
    workModeOnsite: '🏢 现场办公',
    workModeHybrid: '🔄 混合办公',
    workModeRemote: '🏠 远程',
    ratingPrefix: '评级: ',
    settingsLabel: '⚙️ 后端环境设置',
    envLocal: '本地服务',
    envOnline: '线上 Vercel',
    apiUrlLabel: 'Vercel 线上 API 地址',
    apiUrlPlaceholder: '留空则默认 http://localhost:3000',
    btnSaveApi: '保存配置',
    btnResetApi: '恢复本地',
  },
  fr: {
    userStatusLogin: '👤 Se connecter',
    userStatusTitle: 'Cliquer pour vous connecter',
    currentAccount: 'Compte actuellement connecté',
    openBoard: '📊 Ouvrir le tableau de bord',
    logout: 'Se déconnecter',
    loggedOutNotice: 'Vous êtes déconnecté en toute sécurité',
    loginTitle: 'Connexion à FR Job Tracker',
    loginDesc: 'Vos données seront synchronisées en toute sécurité avec votre tableau de bord.',
    emailLabel: 'Adresse e-mail',
    passwordLabel: 'Mot de passe',
    loginBtn: 'Se connecter et continuer',
    loggingIn: 'Connexion en cours...',
    inputEmailPassword: 'Veuillez saisir votre e-mail et mot de passe',
    loginFailed: 'Échec de connexion, vérifiez vos identifiants',
    loginError: 'Erreur de connexion',
    noAccount: 'Pas encore de compte ?',
    registerWeb: 'Créer un compte sur le Web →',
    loadingTitle: 'Analyse de la page en cours...',
    loadingSubtitle: 'Extraction DOM · Analyse structurée · Détection de doublons',
    extractError: 'Impossible d’extraire les informations de l’offre',
    btnRetry: 'Réessayer l’extraction',
    successTitle: 'Candidature enregistrée avec succès !',
    btnOpenBoard: 'Voir dans le tableau de bord',
    warnDupTitle: 'Doublon potentiel détecté !',
    warnDupCount: (n) => `${n} candidature(s) existante(s) trouvée(s) !`,
    chkForce: 'Poste différent confirmé, forcer l’enregistrement',
    btnForceSave: '⚠️ Forcer l’enregistrement',
    btnBlockedSave: '⚠️ Doublon détecté, envoi bloqué',
    starTitle: 'Ajouter aux favoris (étoile)',
    starActiveTitle: 'Retirer des favoris',
    unknownCompany: 'Entreprise inconnue',
    unknownTitle: 'Poste inconnu',
    noLocation: 'Lieu non précisé',
    salaryNegotiable: 'Salaire à négocier',
    salaryNotSpecified: 'Salaire non précisé',
    labelRating: 'Évaluation (Rating)',
    labelStatus: 'Statut initial',
    labelContract: 'Type de contrat',
    labelWorkMode: 'Mode de travail',
    labelLocation: 'Lieu de travail',
    labelSalary: 'Fourchette salariale',
    labelPosted: 'Date de publication',
    labelHr: 'Contact RH (Nom/Tél/Email)',
    labelNotes: 'Notes de candidature',
    placeholderLocation: 'Ex : Paris (75)',
    placeholderSalary: 'Ex : 45k - 55k € ou à négocier',
    placeholderPosted: 'Ex : 2026-10-25',
    placeholderHr: 'Ex : 06 12 34 56 78 ou Marie',
    placeholderNotes: 'Ex : Version CV, recommandation...',
    ratingSPlus: '🔥 S+ (Cible prioritaire absolue)',
    ratingS: '💎 S (Objectif clé)',
    ratingAPlus: '🌟 A+ (Excellente opportunité)',
    ratingA: '✨ A (Bonne opportunité)',
    ratingAMinus: '⭐ A- (Opportunité valable)',
    ratingB: '🎯 B (Candidature standard)',
    ratingC: '💤 C (Repli / En veille)',
    optionStatusApplied: '🚀 Postulé directement (Applied)',
    optionStatusSaved: '📌 Sauvegardé sans postuler (Saved)',
    optionContractCdi: 'CDI (Contrat à durée indéterminée)',
    optionContractCdd: 'CDD (Contrat à durée déterminée)',
    optionContractFreelance: 'FREELANCE (Indépendant)',
    optionContractStage: 'STAGE (Stage conventionné)',
    optionContractAlternance: 'ALTERNANCE (Apprentissage / Pro)',
    optionContractUnknown: 'UNKNOWN (Non spécifié)',
    optionWorkModeNone: 'Non précisé / Par défaut',
    optionWorkModeOnsite: '🏢 Sur site (On-site)',
    optionWorkModeHybrid: '🔄 Hybride (Hybrid)',
    optionWorkModeRemote: '🏠 Télétravail (Remote)',
    btnSave: '🚀 Confirmer la candidature',
    btnSaveSaved: '📌 Sauvegarder sans postuler',
    btnClose: 'Fermer la fenêtre',
    saving: 'Enregistrement en cours...',
    statusApplied: '🚀 Déjà postulé',
    statusSaved: '📌 Sauvegardé',
    workModeOnsite: '🏢 Sur site',
    workModeHybrid: '🔄 Hybride',
    workModeRemote: '🏠 Télétravail',
    ratingPrefix: 'Note : ',
    settingsLabel: '⚙️ Configuration API',
    envLocal: 'Localhost',
    envOnline: 'Vercel Cloud',
    apiUrlLabel: 'URL de l’API en ligne Vercel',
    apiUrlPlaceholder: 'Vide par défaut : http://localhost:3000',
    btnSaveApi: 'Enregistrer',
    btnResetApi: 'Rétablir local',
  },
  en: {
    userStatusLogin: '👤 Sign In',
    userStatusTitle: 'Click to sign in',
    currentAccount: 'Currently signed in as',
    openBoard: '📊 Open Dashboard',
    logout: 'Sign Out',
    loggedOutNotice: 'You have been securely signed out',
    loginTitle: 'Sign in to FR Job Tracker',
    loginDesc: 'Your applications will be securely isolated and synced with your private board.',
    emailLabel: 'Account Email',
    passwordLabel: 'Password',
    loginBtn: 'Sign In & Continue',
    loggingIn: 'Signing in...',
    inputEmailPassword: 'Please enter your email and password',
    loginFailed: 'Sign in failed, please check your credentials',
    loginError: 'Sign in error',
    noAccount: 'Don’t have an account?',
    registerWeb: 'Register on Web →',
    loadingTitle: 'Parsing current job page...',
    loadingSubtitle: 'Instant DOM extraction · Structured parsing · Real-time duplicate check',
    extractError: 'Failed to extract job information from page',
    btnRetry: 'Retry Extraction',
    successTitle: 'Job application saved successfully!',
    btnOpenBoard: 'View in Dashboard',
    warnDupTitle: 'Duplicate application detected!',
    warnDupCount: (n) => `Found ${n} existing application(s)!`,
    chkForce: 'Confirm different position, force record',
    btnForceSave: '⚠️ Force Record Application',
    btnBlockedSave: '⚠️ Duplicate found, submission blocked',
    starTitle: 'Mark as starred',
    starActiveTitle: 'Remove from starred',
    unknownCompany: 'Unknown Company',
    unknownTitle: 'Unknown Position',
    noLocation: 'Location not specified',
    salaryNegotiable: 'Negotiable salary',
    salaryNotSpecified: 'Salary not specified',
    labelRating: 'Job Rating',
    labelStatus: 'Initial Status',
    labelContract: 'Contract Type',
    labelWorkMode: 'Work Mode',
    labelLocation: 'Location',
    labelSalary: 'Salary Range',
    labelPosted: 'Posted Date',
    labelHr: 'HR Contact (Name/Phone/Email)',
    labelNotes: 'Application Notes',
    placeholderLocation: 'e.g., Paris (75)',
    placeholderSalary: 'e.g., 45k - 55k € or competitive',
    placeholderPosted: 'e.g., 2026-10-25',
    placeholderHr: 'e.g., +33 6 12 34 56 78 or Marie',
    placeholderNotes: 'e.g., Resume version, referral code...',
    ratingSPlus: '🔥 S+ (Top Priority / Dream)',
    ratingS: '💎 S (Key Target)',
    ratingAPlus: '🌟 A+ (Great Match)',
    ratingA: '✨ A (Good Opportunity)',
    ratingAMinus: '⭐ A- (Qualified / Apply)',
    ratingB: '🎯 B (Standard / Baseline)',
    ratingC: '💤 C (Backup / Watchlist)',
    optionStatusApplied: '🚀 Applied directly',
    optionStatusSaved: '📌 Saved for later',
    optionContractCdi: 'CDI (Permanent / Full-Time)',
    optionContractCdd: 'CDD (Fixed-Term Contract)',
    optionContractFreelance: 'FREELANCE (Contractor / B2B)',
    optionContractStage: 'STAGE (Internship)',
    optionContractAlternance: 'ALTERNANCE (Apprenticeship)',
    optionContractUnknown: 'UNKNOWN (Unspecified)',
    optionWorkModeNone: 'Not specified / Default',
    optionWorkModeOnsite: '🏢 On-site',
    optionWorkModeHybrid: '🔄 Hybrid',
    optionWorkModeRemote: '🏠 Remote',
    btnSave: '🚀 Confirm Application',
    btnSaveSaved: '📌 Save for Later',
    btnClose: 'Close Window',
    saving: 'Saving application...',
    statusApplied: '🚀 Applied directly',
    statusSaved: '📌 Saved for later',
    workModeOnsite: '🏢 On-site',
    workModeHybrid: '🔄 Hybrid',
    workModeRemote: '🏠 Remote',
    ratingPrefix: 'Rating: ',
    settingsLabel: '⚙️ Backend API Settings',
    envLocal: 'Local Dev',
    envOnline: 'Vercel Cloud',
    apiUrlLabel: 'Online Vercel API Base URL',
    apiUrlPlaceholder: 'Leave empty for http://localhost:3000',
    btnSaveApi: 'Save Config',
    btnResetApi: 'Reset to Local',
  },
};

// 语言切换 DOM
const selectLangEl = document.getElementById('select-lang');

// 设置面板相关 DOM
const toggleSettingsEl = document.getElementById('toggle-settings');
const settingsPanelEl = document.getElementById('settings-panel');
const apiUrlInputEl = document.getElementById('api-url-input');
const saveApiBtnEl = document.getElementById('save-api-btn');
const resetApiBtnEl = document.getElementById('reset-api-btn');
const currentEnvLabelEl = document.getElementById('current-env-label');

// 账号与登录相关 DOM
const btnUserStatusEl = document.getElementById('btn-user-status');
const userStatusTextEl = document.getElementById('user-status-text');
const userMenuPopoverEl = document.getElementById('user-menu-popover');
const popoverUserEmailEl = document.getElementById('popover-user-email');
const btnGoDashboardEl = document.getElementById('btn-go-dashboard');
const btnLogoutEl = document.getElementById('btn-logout');

const loginViewEl = document.getElementById('login-view');
const loginEmailEl = document.getElementById('login-email');
const loginPasswordEl = document.getElementById('login-password');
const loginErrorMsgEl = document.getElementById('login-error-msg');
const btnSubmitLoginEl = document.getElementById('btn-submit-login');
const linkWebRegisterEl = document.getElementById('link-web-register');

let currentSession = null;

// 读取存储的 Session
async function getStoredSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['auth_session'], (result) => {
      resolve(result.auth_session || null);
    });
  });
}

// 写入 Session
async function setStoredSession(session) {
  currentSession = session;
  return new Promise((resolve) => {
    chrome.storage.local.set({ auth_session: session }, () => {
      updateUserStatusUI();
      resolve();
    });
  });
}

// 清除 Session
async function clearStoredSession() {
  currentSession = null;
  return new Promise((resolve) => {
    chrome.storage.local.remove(['auth_session'], () => {
      updateUserStatusUI();
      resolve();
    });
  });
}

// 更新 Header 账号状态按钮 UI
async function updateUserStatusUI() {
  if (!currentSession) {
    currentSession = await getStoredSession();
  }
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
  if (currentSession && currentSession.user_email) {
    const prefix = currentSession.user_email.split('@')[0];
    if (userStatusTextEl) userStatusTextEl.textContent = `👤 ${prefix}`;
    if (btnUserStatusEl) btnUserStatusEl.title = currentSession.user_email;
    if (popoverUserEmailEl) popoverUserEmailEl.textContent = currentSession.user_email;
  } else {
    if (userStatusTextEl) userStatusTextEl.textContent = t.userStatusLogin;
    if (btnUserStatusEl) btnUserStatusEl.title = t.userStatusTitle;
  }
}

// 获取有效的 Access Token (带自动刷新)
async function getValidToken() {
  if (!currentSession) {
    currentSession = await getStoredSession();
  }
  if (!currentSession || !currentSession.access_token) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  // 若 Token 即将或已经过期（60 秒缓冲），尝试刷新
  if (currentSession.expires_at && currentSession.expires_at - now < 60 && currentSession.refresh_token) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: currentSession.refresh_token }),
      });
      if (res.ok) {
        const data = await res.json();
        const newSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user_email: data.user?.email || currentSession.user_email,
          expires_at: data.session.expires_at,
        };
        await setStoredSession(newSession);
        return newSession.access_token;
      } else {
        await clearStoredSession();
        return null;
      }
    } catch {
      return currentSession.access_token;
    }
  }

  return currentSession.access_token;
}

// 显示登录面板
function showLoginView(errorMsg = '') {
  if (loadingEl) loadingEl.style.display = 'none';
  if (mainViewEl) mainViewEl.style.display = 'none';
  if (errorViewEl) errorViewEl.style.display = 'none';
  if (successViewEl) successViewEl.style.display = 'none';
  if (userMenuPopoverEl) userMenuPopoverEl.style.display = 'none';
  if (loginViewEl) loginViewEl.style.display = 'block';

  if (loginErrorMsgEl) {
    if (errorMsg) {
      loginErrorMsgEl.textContent = errorMsg;
      loginErrorMsgEl.style.display = 'block';
    } else {
      loginErrorMsgEl.style.display = 'none';
    }
  }
}

// 隐藏登录面板
function hideLoginView() {
  if (loginViewEl) loginViewEl.style.display = 'none';
}

// 登录提交处理
async function handleLogin() {
  const email = loginEmailEl?.value.trim();
  const password = loginPasswordEl?.value;
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;

  if (!email || !password) {
    if (loginErrorMsgEl) {
      loginErrorMsgEl.textContent = t.inputEmailPassword;
      loginErrorMsgEl.style.display = 'block';
    }
    return;
  }

  if (btnSubmitLoginEl) {
    btnSubmitLoginEl.disabled = true;
    btnSubmitLoginEl.textContent = t.loggingIn;
  }
  if (loginErrorMsgEl) loginErrorMsgEl.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || t.loginFailed);
    }

    const newSession = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_email: data.user.email,
      expires_at: data.session.expires_at,
    };

    await setStoredSession(newSession);
    hideLoginView();
    runExtraction();
  } catch (err) {
    if (loginErrorMsgEl) {
      loginErrorMsgEl.textContent = err.message || t.loginError;
      loginErrorMsgEl.style.display = 'block';
    }
  } finally {
    if (btnSubmitLoginEl) {
      btnSubmitLoginEl.disabled = false;
      btnSubmitLoginEl.textContent = t.loginBtn;
    }
  }
}

// 初始化加载 API 地址配置
async function initApiBase() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['custom_api_url'], (result) => {
      const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
      if (result.custom_api_url) {
        API_BASE = result.custom_api_url.replace(/\/+$/, '');
        if (currentEnvLabelEl) {
          currentEnvLabelEl.textContent = t.envOnline;
          currentEnvLabelEl.style.color = '#34d399';
        }
        if (apiUrlInputEl) apiUrlInputEl.value = API_BASE;
      } else {
        API_BASE = 'http://localhost:3000';
        if (currentEnvLabelEl) {
          currentEnvLabelEl.textContent = t.envLocal;
          currentEnvLabelEl.style.color = '#60a5fa';
        }
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

    // 1. CDI / 全职 / Permanent / Temps plein (兼容 schema.org FULL_TIME)
    if (
      /(?:\b(?:cdi|permanent|indefinite|full[-_ ]?time|temps\s+plein)\b|全职|无固定期限)/i.test(
        norm
      ) ||
      /duree\s+indeterminee/i.test(norm)
    ) {
      return 'CDI';
    }

    // 2. CDD / 短期 / 合同工 / Fixed-term / Temporary / Intérim
    if (
      /(?:\b(?:cdd|fixed[-_ ]?term|temporary|interim)\b|短期|合同工|固定期限)/i.test(
        norm
      ) ||
      /duree\s+determinee/i.test(norm)
    ) {
      return 'CDD';
    }

    // 3. FREELANCE / 自由职业 / Indépendant / TJM / Auto-entrepreneur
    if (
      /(?:\b(?:freelance|independant|tjm|auto[-_ ]?entrepreneur|contractor)\b|自由职业)/i.test(
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
    if (/(?:\b(?:stage|internship|intern|stagiaire)\b|实习)/i.test(norm)) {
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
    let cleaned = loc
      .replace(/\s*Localiser\s+l['’\u2019]adresse/gi, '')
      .replace(/\s*Localiser.*$/gi, '')
      .trim();

    const parts = cleaned
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
    let apecLoc = '';
    const addressContainer = document.querySelector('.rod-detail-keypoints-infos--adress');
    if (addressContainer) {
      // 优先直接提取纯城市/省份的 <p> 标签，避开紧随其后的 <a>Localiser l’adresse</a> 按钮
      const pEl = addressContainer.querySelector('p');
      if (pEl && pEl.innerText) {
        apecLoc = pEl.innerText.trim();
      } else {
        const clone = addressContainer.cloneNode(true);
        clone.querySelectorAll('a, button').forEach((el) => el.remove());
        apecLoc = clone.innerText.trim();
      }
    } else {
      const fallbackLocEl = document.querySelector('.card-offer-location, [itemprop="jobLocation"]');
      if (fallbackLocEl && fallbackLocEl.innerText) {
        apecLoc = fallbackLocEl.innerText.trim();
      }
    }

    if (apecLoc) {
      domExtracted.location = dedupeLocationString(apecLoc);
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
    domExtracted.platform = 'HELLOWORK';

    // 1. 外部职位 ID 与 cleanUrl
    const hwIdMatch = url.match(/\/emplois\/(\d+)\.html/i);
    if (hwIdMatch) {
      domExtracted.externalJobId = hwIdMatch[1];
      try {
        const parsed = new URL(url);
        domExtracted.cleanUrl = `${parsed.origin}/fr-fr/emplois/${hwIdMatch[1]}.html`;
      } catch {
        domExtracted.cleanUrl = `https://www.hellowork.com/fr-fr/emplois/${hwIdMatch[1]}.html`;
      }
    }

    // 2. 职位标题 (titleRaw)
    const titleEl = document.querySelector('[data-cy="jobTitle"], main h1, h1');
    if (titleEl && titleEl.innerText) {
      const cleanTitle = titleEl.innerText.trim();
      if (cleanTitle) {
        domExtracted.titleRaw = cleanTitle;
      }
    }

    // 3. 公司名称 (companyRaw)
    const compEl = document.querySelector(
      'a[href*="/entreprises/"], [data-cy="companyCollapseButton"] h2, [data-cy="companyCollapseButton"], main h1 a, h1 a'
    );
    if (compEl && compEl.innerText) {
      const cleanComp = compEl.innerText.replace(/^Bienvenue chez\s+/i, '').trim();
      if (cleanComp) {
        domExtracted.companyRaw = cleanComp;
      }
    }

    // 4. 工作地点 (location) 与合同类型 (contractType)
    // HelloWork 在 h1 旁边或父级紧随其后的 <ul> 中存放地点与合同类型：
    // 结构例如：<div><h1 id="main-content">...</h1><ul class="mt-3 flex"><li>Paris - 75</li><li>CDI</li></ul></div>
    let headerLis = [];
    const h1El =
      document.querySelector('main h1, h1#main-content, [data-cy="jobTitle"]')?.closest('h1') ||
      document.querySelector('h1');
    if (h1El) {
      const parentEl = h1El.parentElement;
      const targetUl =
        h1El.nextElementSibling && h1El.nextElementSibling.tagName === 'UL'
          ? h1El.nextElementSibling
          : parentEl
          ? parentEl.querySelector('ul')
          : null;
      if (targetUl) {
        headerLis = Array.from(targetUl.querySelectorAll('li'));
      }
    }

    if (headerLis.length === 0) {
      headerLis = Array.from(document.querySelectorAll('main h1 ~ ul li, main h1 + ul li'));
    }

    const isJunkText = (t) =>
      /r[eé]sum[eé]|analyse\s+de\s+cv|coach|entretien|alerte|connexion|recherche/i.test(t);

    if (headerLis.length > 0) {
      for (const li of headerLis) {
        const liText = (li.innerText || '').trim();
        if (!liText || isJunkText(liText)) continue;

        // 判断是否是合同类型
        const cType = extractContractType(liText);
        if (
          cType &&
          cType !== 'UNKNOWN' &&
          (!domExtracted.contractType || domExtracted.contractType === 'UNKNOWN')
        ) {
          domExtracted.contractType = cType;
          continue;
        }

        // 判断是否是地点 (排除薪资和教育背景)
        if (!domExtracted.location && !/€|an|mois|bac/i.test(liText)) {
          domExtracted.location = dedupeLocationString(liText);
        }
      }
    }

    // 后备：如果上面的 ul 未抓取到地点，尝试从 [data-cy="localisationCard"] 提取
    if (!domExtracted.location) {
      const locCard = document.querySelector('[data-cy="localisationCard"]');
      if (locCard && locCard.innerText) {
        const txt = locCard.innerText.trim();
        if (txt && !isJunkText(txt)) {
          domExtracted.location = dedupeLocationString(txt);
        }
      }
    }

    // 后备：如果上面的 ul 未抓取到合同类型，尝试从 [data-cy="contractCard"] 提取
    if (!domExtracted.contractType || domExtracted.contractType === 'UNKNOWN') {
      const contractCard = document.querySelector('[data-cy="contractCard"]');
      if (contractCard && contractCard.innerText) {
        const cType = extractContractType(contractCard.innerText);
        if (cType && cType !== 'UNKNOWN') {
          domExtracted.contractType = cType;
        }
      }
    }

    // 5. 薪资提取 (salaryRange)
    const salaryEl = document.querySelector('[data-cy="salary-tag-button"]');
    if (salaryEl && salaryEl.innerText) {
      const sal = extractSalaryRange(salaryEl.innerText);
      if (sal) {
        domExtracted.salaryRange = sal;
      }
    }

    // 6. 关键标签提炼：办公方式 (workMode) 与其他标签
    const tagElements = Array.from(
      document.querySelectorAll('[data-cy="salary-tag-button"], .tag-secondary-s, [class*="tag-"]')
    );
    for (const tagEl of tagElements) {
      const tagText = (tagEl.innerText || '').trim();
      if (!tagText) continue;

      if (!domExtracted.workMode || domExtracted.workMode === 'UNKNOWN') {
        const mode = extractWorkMode(tagText);
        if (mode) domExtracted.workMode = mode;
      }

      if (!domExtracted.salaryRange) {
        const sal = extractSalaryRange(tagText);
        if (sal) domExtracted.salaryRange = sal;
      }
    }

    // 7. 发布时间 (postedAt)
    const hwDateEl = document.querySelector('[data-testid="job-meta-date"], .offer-header-date');
    if (hwDateEl && hwDateEl.innerText) {
      const parsed = parsePostedDate(hwDateEl.innerText.trim());
      domExtracted.postedAt = parsed || hwDateEl.innerText.trim();
    } else {
      // 从正文寻找 "Publiée le 26/10/2026"
      const allText = document.body ? document.body.innerText : '';
      const dateMatch = allText.match(/Publi[eé]e\s+le\s+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
      if (dateMatch && dateMatch[1]) {
        const parsed = parsePostedDate(dateMatch[1]);
        if (parsed) domExtracted.postedAt = parsed;
      }
    }

    // 8. 详情正文
    const jdContainer = document.querySelector(
      '[data-cy="jobDescription"], .job-description, .content-description, main article, main'
    );
    if (jdContainer && jdContainer.innerText) {
      domExtracted.jdContent = jdContainer.innerText.trim();
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
  await updateUserStatusUI();
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;

  const token = await getValidToken();
  if (!token) {
    showLoginView(t.loginFirstPrompt);
    return;
  }

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
      throw new Error(t.extractError);
    }

    const extracted = injectionResults[0].result;

    const res = await fetch(`${API_BASE}/api/parse-and-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(extracted),
    });

    if (res.status === 401) {
      await clearStoredSession();
      showLoginView(t.loginExpiredPrompt);
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `服务端响应错误 (${res.status})`);
    }

    const data = await res.json();
    currentParsedJob = data.parsedJob;
    currentDuplicates = data.duplicates || [];

    renderResult(currentParsedJob, currentDuplicates);
  } catch (err) {
    showError(err.message || (I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh).extractError);
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
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
  if (mode === 'ONSITE') {
    valWorkModeEl.style.display = 'inline-block';
    valWorkModeEl.textContent = t.workModeOnsite;
  } else if (mode === 'HYBRID') {
    valWorkModeEl.style.display = 'inline-block';
    valWorkModeEl.textContent = t.workModeHybrid;
  } else if (mode === 'REMOTE') {
    valWorkModeEl.style.display = 'inline-block';
    valWorkModeEl.textContent = t.workModeRemote;
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
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
  if (btnStarEl) {
    if (isStarred) {
      btnStarEl.classList.add('active');
      btnStarEl.title = t.starActiveTitle;
    } else {
      btnStarEl.classList.remove('active');
      btnStarEl.title = t.starTitle;
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
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
  valRatingEl.textContent = `${icon} ${t.ratingPrefix}${r}`;
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
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
  if (valStatusBadgeEl) {
    if (status === 'SAVED') {
      valStatusBadgeEl.textContent = t.statusSaved;
      valStatusBadgeEl.style.background = 'rgba(245, 158, 11, 0.2)';
      valStatusBadgeEl.style.color = '#fbbf24';
      valStatusBadgeEl.style.borderColor = '#f59e0b';
      if (!btnSaveEl.disabled) btnSaveEl.textContent = t.btnSaveSaved;
    } else {
      valStatusBadgeEl.textContent = t.statusApplied;
      valStatusBadgeEl.style.background = 'rgba(37, 99, 235, 0.2)';
      valStatusBadgeEl.style.color = '#60a5fa';
      valStatusBadgeEl.style.borderColor = '#2563eb';
      if (!btnSaveEl.disabled) btnSaveEl.textContent = t.btnSave;
    }
  }
}

// 渲染结果
function renderResult(job, duplicates) {
  loadingEl.style.display = 'none';
  errorViewEl.style.display = 'none';
  successViewEl.style.display = 'none';
  mainViewEl.style.display = 'block';

  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;

  valPlatformEl.textContent = job.platform || 'OTHER';
  valIdEl.textContent = job.externalJobId ? `#${job.externalJobId}` : '';
  valCompanyEl.textContent = job.companyRaw || t.unknownCompany;
  valTitleEl.textContent = job.titleRaw || t.unknownTitle;

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
  valLocationEl.textContent = job.location || t.noLocation;
  inputLocationEl.value = job.location || '';

  // 6. 薪资输入框与展示联动
  valSalaryEl.textContent = job.salaryRange || t.salaryNotSpecified;
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
    warningCountTextEl.textContent = t.warnDupCount(duplicates.length);

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
            ${t.labelStatus}: <strong style="color: #cbd5e1;">${d.matchedApplication?.status || 'APPLIED'}</strong>
          </div>
        </div>
      `
      )
      .join('');

    chkForceEl.checked = false;
    btnSaveEl.disabled = true;
    btnSaveEl.textContent = t.btnBlockedSave;
  } else {
    warningSectionEl.style.display = 'none';
    chkForceEl.checked = true;
    btnSaveEl.disabled = false;
    const currentStatus = selectStatusEl?.value || 'APPLIED';
    btnSaveEl.textContent = currentStatus === 'SAVED' ? t.btnSaveSaved : t.btnSave;
  }
}

// 保存投递
async function saveApplication() {
  if (!currentParsedJob) return;
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;

  btnSaveEl.disabled = true;
  btnSaveEl.textContent = t.saving;

  try {
    const chosenContract = selectContractEl.value || currentParsedJob.contractType || 'UNKNOWN';
    const chosenWorkMode = selectWorkModeEl.value || null;
    const chosenLocation = inputLocationEl.value.trim() || null;
    const chosenSalary = inputSalaryEl.value.trim() || null;
    const chosenPostedAt = inputPostedEl.value.trim() || null;
    const chosenRating = selectRatingEl?.value || 'B';
    const chosenStatus = selectStatusEl?.value || 'APPLIED';

    const token = await getValidToken();
    if (!token) {
      showLoginView(t.loginExpiredPrompt);
      return;
    }

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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      await clearStoredSession();
      showLoginView(t.loginExpiredPrompt);
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || '保存到数据库失败');
    }

    mainViewEl.style.display = 'none';
    successViewEl.style.display = 'block';
    successJobNameEl.textContent = `${currentParsedJob.companyRaw} · ${currentParsedJob.titleRaw}`;
  } catch (err) {
    alert(`${t.saveFailed}${err.message}`);
    btnSaveEl.disabled = false;
    const currentStatus = selectStatusEl?.value || 'APPLIED';
    btnSaveEl.textContent = currentStatus === 'SAVED' ? t.btnSaveSaved : t.btnSave;
  }
}

// 辅助状态切换
function showLoading() {
  if (loginViewEl) loginViewEl.style.display = 'none';
  loadingEl.style.display = 'flex';
  mainViewEl.style.display = 'none';
  errorViewEl.style.display = 'none';
  successViewEl.style.display = 'none';
}

function showError(msg) {
  if (loginViewEl) loginViewEl.style.display = 'none';
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
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
  valLocationEl.textContent = inputLocationEl.value.trim() || t.noLocation;
});

inputSalaryEl.addEventListener('input', () => {
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
  valSalaryEl.textContent = inputSalaryEl.value.trim() || t.salaryNegotiable;
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
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
  if (chkForceEl.checked) {
    btnSaveEl.disabled = false;
    btnSaveEl.textContent = t.btnForceSave;
  } else {
    btnSaveEl.disabled = true;
    btnSaveEl.textContent = t.btnBlockedSave;
  }
});

btnSaveEl.addEventListener('click', saveApplication);
btnCloseEl.addEventListener('click', () => window.close());
btnRetryEl.addEventListener('click', runExtraction);
btnOpenBoardEl.addEventListener('click', () => {
  chrome.tabs.create({ url: API_BASE });
  window.close();
});

// 账号与登录相关交互事件绑定
if (btnSubmitLoginEl) {
  btnSubmitLoginEl.addEventListener('click', handleLogin);
}

if (loginPasswordEl) {
  loginPasswordEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
}

if (linkWebRegisterEl) {
  linkWebRegisterEl.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${API_BASE}/login` });
  });
}

if (btnUserStatusEl) {
  btnUserStatusEl.addEventListener('click', async (e) => {
    e.stopPropagation();
    const token = await getValidToken();
    if (!token) {
      showLoginView();
    } else {
      if (userMenuPopoverEl) {
        userMenuPopoverEl.style.display =
          userMenuPopoverEl.style.display === 'none' || !userMenuPopoverEl.style.display
            ? 'block'
            : 'none';
      }
    }
  });
}

if (btnLogoutEl) {
  btnLogoutEl.addEventListener('click', async () => {
    const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
    await clearStoredSession();
    if (userMenuPopoverEl) userMenuPopoverEl.style.display = 'none';
    showLoginView(t.loggedOutNotice);
  });
}

if (btnGoDashboardEl) {
  btnGoDashboardEl.addEventListener('click', () => {
    chrome.tabs.create({ url: API_BASE });
  });
}

document.addEventListener('click', (e) => {
  if (userMenuPopoverEl && !e.target.closest('#btn-user-status') && !e.target.closest('#user-menu-popover')) {
    userMenuPopoverEl.style.display = 'none';
  }
});

// 绑定设置面板交互事件（做空值保护，绝对不崩溃）
if (toggleSettingsEl && settingsPanelEl) {
  toggleSettingsEl.addEventListener('click', () => {
    settingsPanelEl.style.display = settingsPanelEl.style.display === 'none' ? 'block' : 'none';
  });
}

if (saveApiBtnEl && apiUrlInputEl) {
  saveApiBtnEl.addEventListener('click', async () => {
    const cleanUrl = apiUrlInputEl.value.trim().replace(/\/+$/, '');
    await clearStoredSession();
    chrome.storage.local.set({ custom_api_url: cleanUrl }, () => {
      alert(cleanUrl ? `✅ Online Backend: ${cleanUrl}\nPlease login again` : '✅ Restored localhost\nPlease login again');
      settingsPanelEl.style.display = 'none';
      runExtraction();
    });
  });
}

if (resetApiBtnEl && apiUrlInputEl) {
  resetApiBtnEl.addEventListener('click', async () => {
    await clearStoredSession();
    chrome.storage.local.remove(['custom_api_url'], () => {
      alert('✅ Restored localhost\nPlease login again');
      apiUrlInputEl.value = '';
      settingsPanelEl.style.display = 'none';
      runExtraction();
    });
  });
}

// 国际化语言切换与全量 DOM 文本更新
function applyLocale(lang) {
  currentLang = ['zh', 'fr', 'en'].includes(lang) ? lang : 'zh';
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : currentLang;
  const t = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;

  if (selectLangEl) selectLangEl.value = currentLang;
  updateUserStatusUI();

  // Header 与 Popover
  const popoverHeader = document.querySelector('#user-menu-popover > div:first-child');
  if (popoverHeader) popoverHeader.textContent = t.currentAccount;
  if (btnGoDashboardEl) btnGoDashboardEl.textContent = t.openBoard;
  if (btnLogoutEl) btnLogoutEl.textContent = t.logout;

  // 登录面板
  const loginHeaderTitle = document.querySelector('#login-view .card > div:first-child > span:last-child');
  if (loginHeaderTitle) loginHeaderTitle.textContent = t.loginTitle;
  const loginDescP = document.querySelector('#login-view .card > p');
  if (loginDescP) loginDescP.textContent = t.loginDesc;
  const emailGroupLabel = document.querySelector('#login-view .field-group:nth-of-type(1) .field-label');
  if (emailGroupLabel) emailGroupLabel.textContent = t.emailLabel;
  const passwordGroupLabel = document.querySelector('#login-view .field-group:nth-of-type(2) .field-label');
  if (passwordGroupLabel) passwordGroupLabel.textContent = t.passwordLabel;
  if (btnSubmitLoginEl && !btnSubmitLoginEl.disabled) btnSubmitLoginEl.textContent = t.loginBtn;
  const registerBox = document.querySelector('#login-view .card > div:last-child');
  if (registerBox) {
    registerBox.innerHTML = `${t.noAccount} <a href="#" id="link-web-register" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${t.registerWeb}</a>`;
    const newLink = document.getElementById('link-web-register');
    if (newLink) {
      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: `${API_BASE}/login` });
      });
    }
  }

  // 加载中面板
  const loadingTitleEl = document.querySelector('#loading > div:nth-child(2)');
  if (loadingTitleEl) loadingTitleEl.textContent = t.loadingTitle;
  const loadingSubtitleEl = document.querySelector('#loading > div:nth-child(3)');
  if (loadingSubtitleEl) loadingSubtitleEl.textContent = t.loadingSubtitle;

  // 错误重试按钮
  if (btnRetryEl) btnRetryEl.textContent = t.btnRetry;

  // 成功面板
  const successTitleEl = document.querySelector('#success-view > div:nth-child(2)');
  if (successTitleEl) successTitleEl.textContent = t.successTitle;
  if (btnOpenBoardEl) btnOpenBoardEl.textContent = t.btnOpenBoard;

  // 查重区域
  const chkForceParent = document.querySelector('#warning-section label');
  if (chkForceParent && chkForceEl) {
    const isChecked = chkForceEl.checked;
    chkForceParent.innerHTML = `<input type="checkbox" id="chk-force"> ${t.chkForce}`;
    const newChk = document.getElementById('chk-force');
    if (newChk) {
      newChk.checked = isChecked;
      newChk.addEventListener('change', () => {
        const curT = I18N_EXTENSION[currentLang] || I18N_EXTENSION.zh;
        if (newChk.checked) {
          btnSaveEl.disabled = false;
          btnSaveEl.textContent = curT.btnForceSave;
        } else {
          btnSaveEl.disabled = true;
          btnSaveEl.textContent = curT.btnBlockedSave;
        }
      });
    }
  }

  // 主表单各字段 Label
  const labels = document.querySelectorAll('#main-view .field-label');
  if (labels[0]) labels[0].textContent = t.labelRating;
  if (labels[1]) labels[1].textContent = t.labelStatus;
  if (labels[2]) labels[2].textContent = t.labelContract;
  if (labels[3]) labels[3].textContent = t.labelWorkMode;
  if (labels[4]) labels[4].textContent = t.labelLocation;
  if (labels[5]) labels[5].textContent = t.labelSalary;
  if (labels[6]) labels[6].textContent = t.labelPosted;
  if (labels[7]) labels[7].textContent = t.labelHr;
  if (labels[8]) labels[8].textContent = t.labelNotes;

  // 输入框占位符
  if (inputLocationEl) inputLocationEl.placeholder = t.placeholderLocation;
  if (inputSalaryEl) inputSalaryEl.placeholder = t.placeholderSalary;
  if (inputPostedEl) inputPostedEl.placeholder = t.placeholderPosted;
  if (inputHrEl) inputHrEl.placeholder = t.placeholderHr;
  if (inputNotesEl) inputNotesEl.placeholder = t.placeholderNotes;

  // 各 Select 下拉选项文案动态更新
  if (selectRatingEl && selectRatingEl.options.length >= 7) {
    const curVal = selectRatingEl.value;
    selectRatingEl.options[0].textContent = t.ratingSPlus;
    selectRatingEl.options[1].textContent = t.ratingS;
    selectRatingEl.options[2].textContent = t.ratingAPlus;
    selectRatingEl.options[3].textContent = t.ratingA;
    selectRatingEl.options[4].textContent = t.ratingAMinus;
    selectRatingEl.options[5].textContent = t.ratingB;
    selectRatingEl.options[6].textContent = t.ratingC;
    selectRatingEl.value = curVal;
  }

  if (selectStatusEl && selectStatusEl.options.length >= 2) {
    const curVal = selectStatusEl.value;
    selectStatusEl.options[0].textContent = t.optionStatusApplied;
    selectStatusEl.options[1].textContent = t.optionStatusSaved;
    selectStatusEl.value = curVal;
  }

  if (selectContractEl && selectContractEl.options.length >= 6) {
    const curVal = selectContractEl.value;
    selectContractEl.options[0].textContent = t.optionContractCdi;
    selectContractEl.options[1].textContent = t.optionContractCdd;
    selectContractEl.options[2].textContent = t.optionContractFreelance;
    selectContractEl.options[3].textContent = t.optionContractStage;
    selectContractEl.options[4].textContent = t.optionContractAlternance;
    selectContractEl.options[5].textContent = t.optionContractUnknown;
    selectContractEl.value = curVal;
  }

  if (selectWorkModeEl && selectWorkModeEl.options.length >= 4) {
    const curVal = selectWorkModeEl.value;
    selectWorkModeEl.options[0].textContent = t.optionWorkModeNone;
    selectWorkModeEl.options[1].textContent = t.optionWorkModeOnsite;
    selectWorkModeEl.options[2].textContent = t.optionWorkModeHybrid;
    selectWorkModeEl.options[3].textContent = t.optionWorkModeRemote;
    selectWorkModeEl.value = curVal;
  }

  // 按钮文案
  if (btnCloseEl) btnCloseEl.textContent = t.btnClose;
  if (btnSaveEl) {
    const chk = document.getElementById('chk-force');
    if (chk && !chk.checked && currentDuplicates.length > 0) {
      btnSaveEl.textContent = t.btnBlockedSave;
    } else if (chk && chk.checked && currentDuplicates.length > 0) {
      btnSaveEl.textContent = t.btnForceSave;
    } else {
      btnSaveEl.textContent = selectStatusEl?.value === 'SAVED' ? t.btnSaveSaved : t.btnSave;
    }
  }

  // 设置面板
  if (toggleSettingsEl) {
    const envText = API_BASE.includes('localhost') ? t.envLocal : t.envOnline;
    toggleSettingsEl.innerHTML = `${t.settingsLabel} (<span id="current-env-label" style="color: ${API_BASE.includes('localhost') ? '#60a5fa' : '#34d399'}">${envText}</span>)`;
  }
  const apiLabel = document.querySelector('#settings-panel .field-label');
  if (apiLabel) apiLabel.textContent = t.apiUrlLabel;
  if (apiUrlInputEl) apiUrlInputEl.placeholder = t.apiUrlPlaceholder;
  if (saveApiBtnEl) saveApiBtnEl.textContent = t.btnSaveApi;
  if (resetApiBtnEl) resetApiBtnEl.textContent = t.btnResetApi;

  // 刷新动态徽章
  if (selectRatingEl) updateRatingBadge(selectRatingEl.value);
  if (selectStatusEl) updateStatusUI(selectStatusEl.value);
  if (selectWorkModeEl) updateWorkModeBadge(selectWorkModeEl.value);
  updateStarUI(isStarred);
}

// 插件初始化入口（含语言检测与加载）
async function initApp() {
  const lang = await new Promise((resolve) => {
    chrome.storage.local.get(['ui_lang'], (res) => {
      if (res.ui_lang && ['zh', 'fr', 'en'].includes(res.ui_lang)) {
        resolve(res.ui_lang);
      } else {
        const sys = (chrome.i18n?.getUILanguage?.() || navigator.language || 'zh').toLowerCase();
        if (sys.startsWith('fr')) resolve('fr');
        else if (sys.startsWith('en')) resolve('en');
        else resolve('zh');
      }
    });
  });
  currentLang = lang;
  if (selectLangEl) {
    selectLangEl.value = lang;
    selectLangEl.addEventListener('change', (e) => {
      const newLang = e.target.value;
      currentLang = newLang;
      chrome.storage.local.set({ ui_lang: newLang });
      applyLocale(newLang);
    });
  }
  applyLocale(lang);
  await runExtraction();
}

document.addEventListener('DOMContentLoaded', initApp);
