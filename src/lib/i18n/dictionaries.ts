export type Locale = 'zh' | 'fr' | 'en';

export interface Dictionary {
  common: {
    cancel: string;
    confirm: string;
    save: string;
    saving: string;
    saved: string;
    delete: string;
    deleting: string;
    close: string;
    edit: string;
    back: string;
    retry: string;
    copy: string;
    copied: string;
    unknown: string;
    loading: string;
    success: string;
    error: string;
    warning: string;
    done: string;
    yes: string;
    no: string;
  };
  header: {
    title: string;
    subtitle: string;
    addJob: string;
    userAccount: string;
  };
  stats: {
    total: string;
    totalTooltip: string;
    saved: string;
    savedTooltip: string;
    replyRate: string;
    replyRateTooltip: string;
    passRate: string;
    passRateTooltip: string;
  };
  search: {
    placeholder: string;
    clear: string;
    matchedCount: string;
  };
  status: {
    ALL: string;
    SAVED: string;
    APPLIED: string;
    HR_CALL: string;
    TECH_INTERVIEW: string;
    OFFER: string;
    REJECTED: string;
    OVER_TWO_MONTHS: string;
    selectStatusTitle: string;
    statusBadgeSaved: string;
    statusBadgeApplied: string;
  };
  workMode: {
    ONSITE: string;
    HYBRID: string;
    REMOTE: string;
    UNSPECIFIED: string;
  };
  rating: {
    label: string;
    S_PLUS: string;
    S: string;
    A_PLUS: string;
    A: string;
    A_MINUS: string;
    B: string;
    C: string;
    SPlus: string;
    APlus: string;
    AMinus: string;
  };
  filter: {
    title: string;
    platform: string;
    minRating: string;
    contract: string;
    starredOnly: string;
    allPlatforms: string;
    otherPlatforms: string;
    allRatings: string;
    allContracts: string;
    viewList: string;
    viewGrid: string;
    listView: string;
    gridView: string;
    list: string;
    grid: string;
    reset: string;
    ratingSPlus: string;
    ratingS: string;
    ratingAPlus: string;
    ratingA: string;
    ratingAMinus: string;
    ratingB: string;
    emptyResult: string;
    emptyHint: string;
  };
  card: {
    star: string;
    unstar: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    postedDate: string;
    posted: string;
    appliedDate: string;
    today: string;
    yesterday: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
    recent: string;
    expandJd: string;
    collapseJd: string;
    jdSmartPreview: string;
    copyAll: string;
    copied: string;
    fullscreenJd: string;
    fullscreenRead: string;
    originalLink: string;
    salaryUnspecified: string;
    locationUnspecified: string;
    details: string;
    notes: string;
    overTwoMonths: string;
    overTwoMonthsTooltip: string;
    statusMenuTitle: string;
    statusTooltip: string;
    loading: string;
    emptyTitle: string;
    emptyDesc: string;
  };
  quickAdd: {
    btnOpen: string;
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    placeholder: string;
    readClipboard: string;
    btnParse: string;
    parseBtn: string;
    parsing: string;
    supportedPlatforms: string;
    previewTitle: string;
    dupWarning: string;
    dupWarningTitle: string;
    dupWarningDesc: string;
    dupHit: string;
    dupAppliedAt: string;
    dupStatusAtTime: string;
    dupOriginalLink: string;
    dupDiscard: string;
    dupForce: string;
    dupHint: string;
    forceRecord: string;
    companyLabel: string;
    titleLabel: string;
    ratingLabel: string;
    initialStatusLabel: string;
    starredLabel: string;
    starredYes: string;
    starredNo: string;
    contractLabel: string;
    workModeLabel: string;
    workModeNotSpecified: string;
    languageLabel: string;
    locationLabel: string;
    salaryLabel: string;
    postedLabel: string;
    hrLabel: string;
    notesLabel: string;
    btnSaveApplied: string;
    btnSaveUnapplied: string;
    saveBtn: string;
    saving: string;
    saveSuccess: string;
    saveFailed: string;
    emptyInputWarning: string;
    emptyAlert: string;
  };
  editModal: {
    title: string;
    subtitle: string;
    company: string;
    jobTitle: string;
    titleField: string;
    platform: string;
    location: string;
    salary: string;
    contract: string;
    contractType: string;
    workMode: string;
    workModeNotSpecified: string;
    language: string;
    status: string;
    rating: string;
    isStarred: string;
    starred: string;
    starredYes: string;
    starredNo: string;
    hrContact: string;
    hrContactPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    jdContent: string;
    charCount: string;
    cleanUrl: string;
    postedAt: string;
    postedDate: string;
    appliedAt: string;
    appliedDate: string;
    saveChanges: string;
    save: string;
    saving: string;
    cancel: string;
    requiredAlert: string;
  };
  jobDetail: {
    title: string;
    copyJd: string;
    copy: string;
    copied: string;
    openFullscreen: string;
    fullscreenRead: string;
    hrContact: string;
    notes: string;
    salary: string;
    location: string;
    workMode: string;
    contractType: string;
    postedDate: string;
    appliedDate: string;
    appliedOn: string;
    originalOffer: string;
    openOriginal: string;
    sourcePage: string;
    notSpecified: string;
    switchStatus: string;
    jdDetail: string;
    editAll: string;
    deleteRecord: string;
    confirmDelete: string;
  };
  jdViewer: {
    title: string;
    copyFull: string;
    copyAll: string;
    copied: string;
    closeTooltip: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
    notesAndContact: string;
    structuredView: string;
    tabSmart: string;
    rawView: string;
    tabRaw: string;
    noContent: string;
    postedOn: string;
    originalPage: string;
    searchPlaceholder: string;
    matchedCount: string;
  };
  login: {
    loginTitle: string;
    registerTitle: string;
    loginSubtitle: string;
    registerSubtitle: string;
    email: string;
    password: string;
    passwordPlaceholder: string;
    btnSignIn: string;
    btnSignUp: string;
    or: string;
    googleLogin: string;
    hasAccount: string;
    noAccount: string;
    toRegister: string;
    toLogin: string;
    securityNote: string;
    verifyingAuth: string;
    emailPasswordRequired: string;
    pwdMinLength: string;
    regSuccessEmailConfirm: string;
    opFailed: string;
    googleFailed: string;
    googleNotConfigured: string;
    processing: string;
  };
  account: {
    title: string;
    currentEmail: string;
    currentLogin: string;
    changePassword: string;
    newPwdLabel: string;
    newPasswordPlaceholder: string;
    newPwdPlaceholder: string;
    confirmPwdLabel: string;
    confirmPwdPlaceholder: string;
    btnUpdatePassword: string;
    savePwd: string;
    savingPwd: string;
    passwordSuccess: string;
    pwdSuccess: string;
    pwdMinLength: string;
    pwdMismatch: string;
    pwdFailed: string;
    clearDataTitle: string;
    clearTitle: string;
    clearDataDesc: string;
    clearDesc: string;
    clearConfirmPrompt: string;
    clearPrompt: string;
    clearPlaceholder: string;
    btnClearData: string;
    clearBtn: string;
    clearing: string;
    clearSuccess: string;
    clearFailed: string;
    deleteAccountTitle: string;
    deleteTitle: string;
    deleteAccountDesc: string;
    deleteWarning: string;
    deleteConfirmPrompt: string;
    deletePrompt: string;
    deletePlaceholder: string;
    btnDeleteAccount: string;
    deleteBtn: string;
    deleting: string;
    deleteFailed: string;
    signOut: string;
    logout: string;
    confirmMismatch: string;
  };
  share: {
    brandHeader: string;
    title: string;
    backToList: string;
    back: string;
    backHomePaste: string;
    parsingTitle: string;
    parsingSubtitle: string;
    savedSuccessTitle: string;
    successTitle: string;
    btnViewBoard: string;
    viewDashboard: string;
    btnConfirmApplied: string;
    saveApplied: string;
    btnSaveForLater: string;
    saveSaved: string;
    dupWarningTitle: string;
    dupWarningDesc: string;
    dupHit: string;
    dupLastApplied: string;
    dupCurrentStatus: string;
    dupOriginalLink: string;
    dupAbandon: string;
    dupDiscard: string;
    dupForce: string;
    noContentError: string;
    emptyAlert: string;
    companyLabel: string;
    titleLabel: string;
    contractLabel: string;
    jdLanguage: string;
    locationLabel: string;
    salaryLabel: string;
    postedLabel: string;
    hrLabel: string;
    notesLabel: string;
    originalJob: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  zh: {
    common: {
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      saving: '正在保存...',
      saved: '已保存',
      delete: '删除',
      deleting: '删除中...',
      close: '关闭',
      edit: '编辑',
      back: '返回',
      retry: '重试',
      copy: '复制',
      copied: '已复制',
      unknown: '未知',
      loading: '加载中...',
      success: '成功',
      error: '错误',
      warning: '警告',
      done: '完成',
      yes: '是',
      no: '否',
    },
    header: {
      title: 'FR Job Tracker',
      subtitle: '零 Token 智能刮削 · 三级防重 · HR 来电急救反查',
      addJob: '录入岗位',
      userAccount: '账号',
    },
    stats: {
      total: '总计',
      totalTooltip: '总记录数: {total} (有效投递: {effective} / 仅保存未投: {saved})',
      saved: '未投',
      savedTooltip: '已保存但尚未正式投递的岗位数',
      replyRate: '回复率',
      replyRateTooltip: '回复数({replied}) / 有效投递数({effective})：排除「未投递」和「已投递」状态后的所有明确反馈占比',
      passRate: '通过率',
      passRateTooltip: '推进数({passed}) / 有效投递数({effective})：排除「未投递」「已投递」和「被拒」后，进入面试或获得 Offer 的比例',
    },
    search: {
      placeholder: '☎️ HR 来电闪电反查：输入电话、公司名、职位、HR姓名、JD关键词... (⌘K)',
      clear: '清空搜索',
      matchedCount: '共匹配到 {count} 条相关记录',
    },
    status: {
      ALL: '全部岗位',
      SAVED: '未投递',
      APPLIED: '已投递',
      HR_CALL: 'HR 沟通',
      TECH_INTERVIEW: '技术面试',
      OFFER: '已获 Offer',
      REJECTED: '未通过',
      OVER_TWO_MONTHS: '已超过2个月',
      selectStatusTitle: '流转状态选择',
      statusBadgeSaved: '仅保存未投',
      statusBadgeApplied: '已直接投递',
    },
    workMode: {
      ONSITE: '现场',
      HYBRID: '混合',
      REMOTE: '远程',
      UNSPECIFIED: '未注明',
    },
    rating: {
      label: '评级',
      S_PLUS: 'S+ (顶级心仪)',
      S: 'S (重点目标)',
      A_PLUS: 'A+ (优质岗位)',
      A: 'A (良好机会)',
      A_MINUS: 'A- (合格可投)',
      B: 'B (基准默认)',
      C: 'C (保底观望)',
      SPlus: 'S+ (顶级心仪)',
      APlus: 'A+ (优质岗位)',
      AMinus: 'A- (合格可投)',
    },
    filter: {
      title: '筛选',
      platform: '平台',
      minRating: '最低评级',
      contract: '合同类型',
      starredOnly: '仅看星标',
      allPlatforms: '全部平台 ({count})',
      otherPlatforms: '其它渠道 ({count})',
      allRatings: '全部评级',
      allContracts: '全部合同',
      viewList: '列表视图',
      viewGrid: '网格视图',
      listView: '列表视图',
      gridView: '网格视图',
      list: '列表',
      grid: '网格',
      reset: '重置筛选',
      ratingSPlus: '仅 S+ (顶级心仪)',
      ratingS: 'S 及以上',
      ratingAPlus: 'A+ 及以上',
      ratingA: 'A 及以上',
      ratingAMinus: 'A- 及以上',
      ratingB: 'B 及以上',
      emptyResult: '未找到符合条件的岗位记录',
      emptyHint: '尝试调整筛选条件，或点击右上角「+ 录入岗位」添加新记录',
    },
    card: {
      star: '设为特别关注',
      unstar: '取消特别关注',
      edit: '编辑职位信息',
      delete: '删除记录',
      deleteConfirm: '再点确认',
      postedDate: '发布',
      posted: '发布',
      appliedDate: '投递时间',
      today: '今天',
      yesterday: '昨天',
      daysAgo: '{n} 天前',
      weeksAgo: '{n} 周前',
      monthsAgo: '{n} 个月前',
      recent: '近期',
      expandJd: '展开完整 JD 正文',
      collapseJd: '收起 JD 正文',
      jdSmartPreview: '智能结构化 JD 速览',
      copyAll: '复制全文',
      copied: '已复制',
      fullscreenJd: '全屏阅读 JD',
      fullscreenRead: '全屏阅读 JD',
      originalLink: '原链接',
      salaryUnspecified: '薪资未注明',
      locationUnspecified: '地点未注明',
      details: '查看详情',
      notes: '备注',
      overTwoMonths: '⚠️ 已超过2个月',
      overTwoMonthsTooltip: '该投递已超过 60 天未推进状态',
      statusMenuTitle: '流转状态选择',
      statusTooltip: '点击快速切换投递状态',
      loading: '正在加载投递数据...',
      emptyTitle: '未找到符合条件的岗位记录',
      emptyDesc: '尝试调整筛选条件，或点击右上角「+ 录入岗位」添加新记录',
    },
    quickAdd: {
      btnOpen: '录入岗位',
      title: '极速录入新岗位',
      subtitle: '粘贴招聘链接 (LinkedIn / Indeed / Apec / HelloWork) 或职位正文，零 Token 本地瞬间清洗并防重',
      inputPlaceholder: '粘贴招聘网址 (https://...) 或整段招聘 JD 文本...',
      placeholder: '粘贴招聘网址 (https://...) 或整段招聘 JD 文本...',
      readClipboard: '读取剪贴板',
      btnParse: '一键智能解析与防重',
      parseBtn: '一键解析与防重',
      parsing: '正在极速解析...',
      supportedPlatforms: '支持 LinkedIn, Indeed FR, Apec, HelloWork, WTTJ 等',
      previewTitle: '结构化解析结果预览（可微调）',
      dupWarning: '检测到高危重复投递！',
      dupWarningTitle: '检测到 {count} 条高危重复投递！',
      dupWarningDesc: '系统通过 L1-L3 防重引擎发现您此前可能已投递过该岗位或同公司相似岗位，建议核对后再决定：',
      dupHit: '命中 {level}',
      dupAppliedAt: '投递于 {date} ({daysAgo})',
      dupStatusAtTime: '当时状态',
      dupOriginalLink: '查看历史链接',
      dupDiscard: '放弃录入 (清空)',
      dupForce: '确认不同岗位，强制记录',
      dupHint: '系统发现您的历史投递库中存在高度相似记录，请核对后再确认是否强制入库',
      forceRecord: '确认不同岗位，允许强制记录',
      companyLabel: '公司名称',
      titleLabel: '职位名称',
      ratingLabel: '岗位评级',
      initialStatusLabel: '初始状态',
      starredLabel: '特别关注 (星标)',
      starredYes: '⭐ 已设为特别关注',
      starredNo: '☆ 设为特别关注',
      contractLabel: '合同类型',
      workModeLabel: '办公方式',
      workModeNotSpecified: '未注明',
      languageLabel: 'JD 语言',
      locationLabel: '工作地点',
      salaryLabel: '薪资范围',
      postedLabel: '发布日期',
      hrLabel: 'HR 联系方式',
      notesLabel: '备注笔记',
      btnSaveApplied: '🚀 确认记录已投递',
      btnSaveUnapplied: '📌 存为未投递',
      saveBtn: '确认记录入库',
      saving: '正在保存...',
      saveSuccess: '已成功记录入库！',
      saveFailed: '保存失败',
      emptyInputWarning: '请先粘贴招聘链接或职位文本内容',
      emptyAlert: '请先粘贴招聘链接或职位文本内容',
    },
    editModal: {
      title: '编辑投递记录',
      subtitle: '修改并微调该岗位的全部结构化字段',
      company: '公司名称',
      jobTitle: '职位名称',
      titleField: '职位名称',
      platform: '来源平台',
      location: '工作地点',
      salary: '薪资范围',
      contract: '合同类型',
      contractType: '合同类型',
      workMode: '办公方式',
      workModeNotSpecified: '未注明',
      language: 'JD 语言',
      status: '当前状态',
      rating: '岗位评级',
      isStarred: '特别关注 (星标)',
      starred: '特别关注 (星标)',
      starredYes: '⭐ 已设为特别关注',
      starredNo: '☆ 设为特别关注',
      hrContact: 'HR 联系方式',
      hrContactPlaceholder: '如: Marie · 06 12 34 56 78',
      notes: '投递备注笔记',
      notesPlaceholder: '如: 投递简历版本、内推人、面试反馈...',
      jdContent: '职位正文 (JD)',
      charCount: '{count} 字符',
      cleanUrl: '原始招聘链接',
      postedAt: '发布日期',
      postedDate: '发布日期',
      appliedAt: '投递日期',
      appliedDate: '投递日期',
      saveChanges: '保存修改',
      save: '保存修改',
      saving: '正在保存...',
      cancel: '取消',
      requiredAlert: '公司名称和职位名称不能为空',
    },
    jobDetail: {
      title: '职位详情速览',
      copyJd: '复制 JD 全文',
      copy: '复制',
      copied: '已复制',
      openFullscreen: '全屏沉浸阅读',
      fullscreenRead: '全屏沉浸阅读 JD',
      hrContact: 'HR 联系方式',
      notes: '备忘笔记',
      salary: '薪资待遇',
      location: '工作地点',
      workMode: '办公方式',
      contractType: '合同类型',
      postedDate: '发布日期',
      appliedDate: '投递时间',
      appliedOn: '投递于 {date} ({daysAgo})',
      originalOffer: '前往原始招聘页',
      openOriginal: '查看原始招聘页',
      sourcePage: '来源',
      notSpecified: '未注明',
      switchStatus: '快速流转状态',
      jdDetail: '职位描述详情',
      editAll: '编辑全部字段',
      deleteRecord: '删除记录',
      confirmDelete: '确认删除？',
    },
    jdViewer: {
      title: '全屏沉浸式 JD 阅读器',
      copyFull: '复制纯文本全文',
      copyAll: '复制全文',
      copied: '已复制',
      closeTooltip: '关闭 (Esc)',
      responsibilities: '核心职责与工作任务 (Missions)',
      requirements: '任职要求与技能画像 (Profil / Requirements)',
      benefits: '福利待遇与公司介绍 (Avantages / About)',
      notesAndContact: 'HR 联系方式与备忘笔记',
      structuredView: '结构化视图',
      tabSmart: '结构化视图',
      rawView: '原始纯文本',
      tabRaw: '原始纯文本',
      noContent: '暂无职位正文描述',
      postedOn: '发布于 {date}',
      originalPage: '原链接',
      searchPlaceholder: '在 JD 中高亮搜索关键词...',
      matchedCount: '{count} 处匹配',
    },
    login: {
      loginTitle: '登录求职看板',
      registerTitle: '立即注册账号',
      loginSubtitle: '登录以访问您的多维求职看板与防重数据',
      registerSubtitle: '创建您的求职雷达独立账户',
      email: '邮箱地址',
      password: '登录密码',
      passwordPlaceholder: '至少 6 位字符',
      btnSignIn: '登录求职看板',
      btnSignUp: '立即注册账号',
      or: '或者',
      googleLogin: '通过 Google 快速登录',
      hasAccount: '已有求职账号？',
      noAccount: '还没有账号？',
      toRegister: '免费注册新账号',
      toLogin: '直接登录',
      securityNote: '全链路 Row Level Security 数据隔离 · 隐私安全保障',
      verifyingAuth: '正在验证登录身份...',
      emailPasswordRequired: '请完整输入邮箱地址与登录密码',
      pwdMinLength: '密码长度至少需 6 位字符',
      regSuccessEmailConfirm: '注册成功！请查收验证邮件完成激活后再登录。',
      opFailed: '操作失败，请重试',
      googleFailed: 'Google 登录失败',
      googleNotConfigured: 'Google OAuth 未在 Supabase 控制台启用。请在 Supabase 后端开启 Google Provider，或者直接使用邮箱密码注册/登录。',
      processing: '处理中...',
    },
    account: {
      title: '账号与安全设置',
      currentEmail: '当前登录邮箱',
      currentLogin: '当前登录账号',
      changePassword: '修改登录密码',
      newPwdLabel: '新密码',
      newPasswordPlaceholder: '输入新密码 (至少 6 位)',
      newPwdPlaceholder: '输入新密码 (至少 6 位)',
      confirmPwdLabel: '确认新密码',
      confirmPwdPlaceholder: '再次输入新密码',
      btnUpdatePassword: '更新密码',
      savePwd: '更新密码',
      savingPwd: '更新中...',
      passwordSuccess: '密码修改成功',
      pwdSuccess: '密码修改成功！',
      pwdMinLength: '新密码至少需要 6 位字符',
      pwdMismatch: '两次输入的密码不一致',
      pwdFailed: '密码更新失败，请重试',
      clearDataTitle: '清空个人投递数据',
      clearTitle: '清空个人投递数据',
      clearDataDesc: '此操作将永久清空您名下的所有投递记录（保留账号本身），操作不可逆。',
      clearDesc: '此操作将永久清空您名下的所有投递记录（保留账号本身），操作不可逆。',
      clearConfirmPrompt: '请输入 "{code}" 以确认清空',
      clearPrompt: '请输入 {word} 以确认清空全部记录',
      clearPlaceholder: '输入 CLEAR',
      btnClearData: '确认清空所有投递数据',
      clearBtn: '清空所有记录',
      clearing: '正在清空...',
      clearSuccess: '已成功清空您的全部投递记录！',
      clearFailed: '清空数据失败，请重试',
      deleteAccountTitle: '永久注销删除账号',
      deleteTitle: '永久注销删除账号',
      deleteAccountDesc: '此操作将彻底删除您的用户身份及所有关联投递数据，无法恢复。',
      deleteWarning: '此操作将彻底删除您的用户身份及所有关联投递数据，无法恢复。',
      deleteConfirmPrompt: '请输入 "{code}" 以确认彻底注销',
      deletePrompt: '请输入 {word} 以确认永久删除账号',
      deletePlaceholder: '输入 DELETE',
      btnDeleteAccount: '确认永久注销并删除账号',
      deleteBtn: '永久注销账号',
      deleting: '正在注销...',
      deleteFailed: '注销账号失败，请重试',
      signOut: '退出登录',
      logout: '退出当前账号',
      confirmMismatch: '输入确认码不匹配，操作已取消',
    },
    share: {
      brandHeader: 'PWA 闪电分享录入',
      title: 'PWA 闪电分享录入',
      backToList: '返回列表',
      back: '返回看板',
      backHomePaste: '返回主页手动粘贴',
      parsingTitle: '正在智能解析岗位并防重比对...',
      parsingSubtitle: '零 Token 正则清洗引擎 · 多维度防重',
      savedSuccessTitle: '岗位已成功录入求职看板！',
      successTitle: '岗位已成功录入求职看板！',
      btnViewBoard: '前往看板查看与反查',
      viewDashboard: '前往看板查看与反查',
      btnConfirmApplied: '🚀 确认记录已投递',
      saveApplied: '🚀 确认记录已投递',
      btnSaveForLater: '📌 存为未投递',
      saveSaved: '📌 存为未投递',
      dupWarningTitle: '检测到 {count} 条高危重复投递！',
      dupWarningDesc: '历史库中发现相似或相同岗位记录，请核对后决定是否继续：',
      dupHit: '命中 {level}',
      dupLastApplied: '投递于 {date}',
      dupCurrentStatus: '当前状态',
      dupOriginalLink: '原链接',
      dupAbandon: '放弃入库',
      dupDiscard: '放弃入库',
      dupForce: '确认不同岗位，强制记录',
      noContentError: '未检测到有效岗位链接或文本，请从招聘软件内重新分享。',
      emptyAlert: '公司名称和职位名称不能为空',
      companyLabel: '公司名称',
      titleLabel: '职位名称',
      contractLabel: '合同类型',
      jdLanguage: 'JD 语言',
      locationLabel: '工作地点',
      salaryLabel: '薪资范围',
      postedLabel: '发布日期',
      hrLabel: 'HR 联系方式',
      notesLabel: '备注笔记',
      originalJob: '查看原岗位链接',
    },
  },
  fr: {
    common: {
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      saved: 'Enregistré',
      delete: 'Supprimer',
      deleting: 'Suppression...',
      close: 'Fermer',
      edit: 'Modifier',
      back: 'Retour',
      retry: 'Réessayer',
      copy: 'Copier',
      copied: 'Copié',
      unknown: 'Inconnu',
      loading: 'Chargement...',
      success: 'Succès',
      error: 'Erreur',
      warning: 'Attention',
      done: 'Terminé',
      yes: 'Oui',
      no: 'Non',
    },
    header: {
      title: 'FR Job Tracker',
      subtitle: 'Extraction Zéro-Token · Anti-doublon · Recherche Flash RH',
      addJob: 'Ajouter',
      userAccount: 'Compte',
    },
    stats: {
      total: 'Total',
      totalTooltip: 'Total : {total} (Actives : {effective} / Sauvegardées : {saved})',
      saved: 'Sauveg.',
      savedTooltip: 'Offres sauvegardées mais pas encore postulées',
      replyRate: 'Réponse',
      replyRateTooltip: 'Réponses ({replied}) / Actives ({effective}) : proportion de candidatures ayant reçu un retour',
      passRate: 'Passage',
      passRateTooltip: 'Avancées ({passed}) / Actives ({effective}) : proportion en entretien RH, technique ou offre',
    },
    search: {
      placeholder: '☎️ Appel RH urgent : téléphone, entreprise, poste, nom RH, mot-clé... (⌘K)',
      clear: 'Effacer',
      matchedCount: '{count} candidature(s) trouvée(s)',
    },
    status: {
      ALL: 'Toutes',
      SAVED: 'Sauvegardé',
      APPLIED: 'Postulé',
      HR_CALL: 'Échange RH',
      TECH_INTERVIEW: 'Entretien Tech',
      OFFER: 'Offre',
      REJECTED: 'Refusé',
      OVER_TWO_MONTHS: '> 2 mois',
      selectStatusTitle: 'Changer le statut',
      statusBadgeSaved: 'Sauvegardé',
      statusBadgeApplied: 'Postulé',
    },
    workMode: {
      ONSITE: 'Sur site',
      HYBRID: 'Hybride',
      REMOTE: 'Télétravail',
      UNSPECIFIED: 'Non précisé',
    },
    rating: {
      label: 'Note',
      S_PLUS: 'S+ (Prioritaire)',
      S: 'S (Cible clé)',
      A_PLUS: 'A+ (Excellente)',
      A: 'A (Bonne)',
      A_MINUS: 'A- (Valable)',
      B: 'B (Standard)',
      C: 'C (Repli)',
      SPlus: 'S+ (Prioritaire)',
      APlus: 'A+ (Excellente)',
      AMinus: 'A- (Valable)',
    },
    filter: {
      title: 'Filtres',
      platform: 'Plateforme',
      minRating: 'Note min.',
      contract: 'Contrat',
      starredOnly: 'Favoris',
      allPlatforms: 'Toutes ({count})',
      otherPlatforms: 'Autres ({count})',
      allRatings: 'Toutes notes',
      allContracts: 'Tous contrats',
      viewList: 'Vue liste',
      viewGrid: 'Vue grille',
      listView: 'Vue liste',
      gridView: 'Vue grille',
      list: 'Liste',
      grid: 'Grille',
      reset: 'Réinitialiser',
      ratingSPlus: 'S+ uniquement',
      ratingS: 'S et plus',
      ratingAPlus: 'A+ et plus',
      ratingA: 'A et plus',
      ratingAMinus: 'A- et plus',
      ratingB: 'B et plus',
      emptyResult: 'Aucune candidature correspondante',
      emptyHint: 'Ajustez vos filtres ou ajoutez une nouvelle offre',
    },
    card: {
      star: 'Ajouter aux favoris',
      unstar: 'Retirer des favoris',
      edit: 'Modifier l’offre',
      delete: 'Supprimer',
      deleteConfirm: 'Confirmer ?',
      postedDate: 'Publiée',
      posted: 'Publiée',
      appliedDate: 'Postulé le',
      today: 'Aujourd’hui',
      yesterday: 'Hier',
      daysAgo: 'Il y a {n}j',
      weeksAgo: 'Il y a {n} sem.',
      monthsAgo: 'Il y a {n} mois',
      recent: 'Récent',
      expandJd: 'Afficher la description complète',
      collapseJd: 'Réduire la description',
      jdSmartPreview: 'Aperçu structuré de l’offre',
      copyAll: 'Tout copier',
      copied: 'Copié',
      fullscreenJd: 'Plein écran',
      fullscreenRead: 'Lire en plein écran',
      originalLink: 'Lien',
      salaryUnspecified: 'Salaire non précisé',
      locationUnspecified: 'Lieu non précisé',
      details: 'Détails',
      notes: 'Notes',
      overTwoMonths: '⚠️ > 2 mois',
      overTwoMonthsTooltip: 'Aucune évolution depuis plus de 60 jours',
      statusMenuTitle: 'Statut de la candidature',
      statusTooltip: 'Cliquer pour changer le statut',
      loading: 'Chargement des candidatures...',
      emptyTitle: 'Aucune candidature trouvée',
      emptyDesc: 'Modifiez vos filtres ou ajoutez une nouvelle candidature.',
    },
    quickAdd: {
      btnOpen: 'Ajouter',
      title: 'Ajout rapide d’offre',
      subtitle: 'Collez un lien (LinkedIn / Indeed / Apec / HelloWork) ou le texte complet pour analyse instantanée',
      inputPlaceholder: 'Collez l’URL (https://...) ou le texte de l’offre...',
      placeholder: 'Collez l’URL (https://...) ou le texte de l’offre...',
      readClipboard: 'Presse-papiers',
      btnParse: 'Analyser & Vérifier',
      parseBtn: 'Analyser & Vérifier',
      parsing: 'Analyse en cours...',
      supportedPlatforms: 'LinkedIn, Indeed FR, Apec, HelloWork, WTTJ, etc.',
      previewTitle: 'Aperçu structuré (modifiable)',
      dupWarning: 'Doublon potentiel détecté !',
      dupWarningTitle: '{count} doublon(s) détecté(s) !',
      dupWarningDesc: 'Des candidatures similaires existent déjà dans votre historique :',
      dupHit: 'Niveau {level}',
      dupAppliedAt: 'Postulé le {date} ({daysAgo})',
      dupStatusAtTime: 'Statut actuel',
      dupOriginalLink: 'Lien historique',
      dupDiscard: 'Abandonner',
      dupForce: 'Forcer l’enregistrement',
      dupHint: 'Vérifiez votre historique avant de forcer l’ajout',
      forceRecord: 'Poste différent confirmé, forcer',
      companyLabel: 'Entreprise',
      titleLabel: 'Intitulé du poste',
      ratingLabel: 'Évaluation',
      initialStatusLabel: 'Statut initial',
      starredLabel: 'Favori',
      starredYes: '⭐ En favoris',
      starredNo: '☆ Ajouter aux favoris',
      contractLabel: 'Contrat',
      workModeLabel: 'Mode de travail',
      workModeNotSpecified: 'Non précisé',
      languageLabel: 'Langue de l’offre',
      locationLabel: 'Lieu',
      salaryLabel: 'Salaire',
      postedLabel: 'Date de publication',
      hrLabel: 'Contact RH',
      notesLabel: 'Notes',
      btnSaveApplied: '🚀 Confirmer (Postulé)',
      btnSaveUnapplied: '📌 Sauvegarder',
      saveBtn: 'Enregistrer la candidature',
      saving: 'Enregistrement...',
      saveSuccess: 'Enregistré avec succès !',
      saveFailed: 'Échec de l’enregistrement',
      emptyInputWarning: 'Veuillez coller un lien ou texte d’offre',
      emptyAlert: 'Veuillez coller un lien ou texte d’offre',
    },
    editModal: {
      title: 'Modifier la candidature',
      subtitle: 'Mettez à jour les informations détaillées de cette offre',
      company: 'Entreprise',
      jobTitle: 'Intitulé du poste',
      titleField: 'Intitulé du poste',
      platform: 'Plateforme',
      location: 'Lieu',
      salary: 'Fourchette salariale',
      contract: 'Type de contrat',
      contractType: 'Type de contrat',
      workMode: 'Mode de travail',
      workModeNotSpecified: 'Non précisé',
      language: 'Langue',
      status: 'Statut actuel',
      rating: 'Évaluation',
      isStarred: 'Favori',
      starred: 'Favori',
      starredYes: '⭐ En favoris',
      starredNo: '☆ Non favori',
      hrContact: 'Contact RH',
      hrContactPlaceholder: 'Ex : Marie · 06 12 34 56 78',
      notes: 'Notes & Remarques',
      notesPlaceholder: 'Ex : Version CV, cooptation, retour d’entretien...',
      jdContent: 'Description du poste (JD)',
      charCount: '{count} car.',
      cleanUrl: 'URL de l’offre',
      postedAt: 'Date de publication',
      postedDate: 'Date de publication',
      appliedAt: 'Date de candidature',
      appliedDate: 'Date de candidature',
      saveChanges: 'Enregistrer',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      cancel: 'Annuler',
      requiredAlert: 'L’entreprise et le titre du poste sont requis',
    },
    jobDetail: {
      title: 'Détails de l’offre',
      copyJd: 'Copier la JD',
      copy: 'Copier',
      copied: 'Copié',
      openFullscreen: 'Plein écran',
      fullscreenRead: 'Lire en plein écran',
      hrContact: 'Contact RH',
      notes: 'Notes personnelles',
      salary: 'Rémunération',
      location: 'Localisation',
      workMode: 'Mode de travail',
      contractType: 'Contrat',
      postedDate: 'Date de publication',
      appliedDate: 'Date de candidature',
      appliedOn: 'Postulé le {date} ({daysAgo})',
      originalOffer: 'Voir l’offre originale',
      openOriginal: 'Ouvrir l’offre originale',
      sourcePage: 'Source',
      notSpecified: 'Non précisé',
      switchStatus: 'Statut rapide',
      jdDetail: 'Description du poste',
      editAll: 'Tout modifier',
      deleteRecord: 'Supprimer',
      confirmDelete: 'Confirmer ?',
    },
    jdViewer: {
      title: 'Lecteur immersif de JD',
      copyFull: 'Copier tout le texte',
      copyAll: 'Tout copier',
      copied: 'Copié',
      closeTooltip: 'Fermer (Esc)',
      responsibilities: 'Missions & Responsabilités',
      requirements: 'Profil recherché & Compétences',
      benefits: 'Avantages & Entreprise',
      notesAndContact: 'Contact RH & Notes',
      structuredView: 'Vue structurée',
      tabSmart: 'Vue structurée',
      rawView: 'Texte brut',
      tabRaw: 'Texte brut',
      noContent: 'Aucune description disponible',
      postedOn: 'Publiée le {date}',
      originalPage: 'Lien original',
      searchPlaceholder: 'Rechercher un mot-clé dans l’offre...',
      matchedCount: '{count} résultat(s)',
    },
    login: {
      loginTitle: 'Connexion au tableau de bord',
      registerTitle: 'Créer un compte',
      loginSubtitle: 'Accédez à votre tableau de bord et à vos données sécurisées',
      registerSubtitle: 'Créez votre compte dédié au suivi de candidatures',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      passwordPlaceholder: '6 caractères minimum',
      btnSignIn: 'Se connecter',
      btnSignUp: 'Créer mon compte',
      or: 'OU',
      googleLogin: 'Continuer avec Google',
      hasAccount: 'Déjà inscrit ?',
      noAccount: 'Pas encore de compte ?',
      toRegister: 'Créer un compte gratuitement',
      toLogin: 'Se connecter',
      securityNote: 'Isolation totale des données avec Row Level Security · Confidentialité garantie',
      verifyingAuth: 'Vérification de la session...',
      emailPasswordRequired: 'Veuillez saisir votre e-mail et mot de passe',
      pwdMinLength: 'Le mot de passe doit comporter au moins 6 caractères',
      regSuccessEmailConfirm: 'Inscription réussie ! Veuillez vérifier vos e-mails pour activer votre compte.',
      opFailed: 'Échec de l’opération, veuillez réessayer',
      googleFailed: 'Échec de la connexion avec Google',
      googleNotConfigured: 'Google OAuth n’est pas activé dans votre console Supabase. Veuillez activer le fournisseur Google ou vous connecter par e-mail et mot de passe.',
      processing: 'Traitement en cours...',
    },
    account: {
      title: 'Paramètres du compte & Sécurité',
      currentEmail: 'E-mail actuel',
      currentLogin: 'Compte connecté',
      changePassword: 'Changer le mot de passe',
      newPwdLabel: 'Nouveau mot de passe',
      newPasswordPlaceholder: 'Nouveau mot de passe (min. 6 car.)',
      newPwdPlaceholder: 'Nouveau mot de passe (min. 6 car.)',
      confirmPwdLabel: 'Confirmer le mot de passe',
      confirmPwdPlaceholder: 'Saisir à nouveau le mot de passe',
      btnUpdatePassword: 'Mettre à jour le mot de passe',
      savePwd: 'Mettre à jour',
      savingPwd: 'Mise à jour...',
      passwordSuccess: 'Mot de passe mis à jour avec succès',
      pwdSuccess: 'Mot de passe mis à jour avec succès',
      pwdMinLength: 'Le mot de passe doit contenir au moins 6 caractères',
      pwdMismatch: 'Les mots de passe ne correspondent pas',
      pwdFailed: 'Échec de la mise à jour',
      clearDataTitle: 'Vider mes candidatures',
      clearTitle: 'Vider mes candidatures',
      clearDataDesc: 'Supprime définitivement toutes vos candidatures en conservant votre compte. Action irréversible.',
      clearDesc: 'Supprime définitivement toutes vos candidatures en conservant votre compte. Action irréversible.',
      clearConfirmPrompt: 'Tapez « {code} » pour confirmer la suppression',
      clearPrompt: 'Tapez {word} pour confirmer la suppression totale',
      clearPlaceholder: 'Tapez CLEAR',
      btnClearData: 'Supprimer toutes les données',
      clearBtn: 'Vider les données',
      clearing: 'Suppression...',
      clearSuccess: 'Toutes vos candidatures ont été supprimées !',
      clearFailed: 'Échec de la suppression',
      deleteAccountTitle: 'Supprimer définitivement le compte',
      deleteTitle: 'Supprimer définitivement le compte',
      deleteAccountDesc: 'Supprime irréversiblement votre compte utilisateur et toutes les données associées.',
      deleteWarning: 'Supprime irréversiblement votre compte utilisateur et toutes les données associées.',
      deleteConfirmPrompt: 'Tapez « {code} » pour confirmer la suppression du compte',
      deletePrompt: 'Tapez {word} pour confirmer la suppression définitive',
      deletePlaceholder: 'Tapez DELETE',
      btnDeleteAccount: 'Supprimer définitivement mon compte',
      deleteBtn: 'Supprimer le compte',
      deleting: 'Suppression...',
      deleteFailed: 'Échec de la suppression du compte',
      signOut: 'Se déconnecter',
      logout: 'Se déconnecter',
      confirmMismatch: 'Le code de confirmation ne correspond pas',
    },
    share: {
      brandHeader: 'Saisie express via PWA',
      title: 'Saisie express PWA',
      backToList: 'Retour',
      back: 'Retour',
      backHomePaste: 'Coller manuellement sur l’accueil',
      parsingTitle: 'Analyse intelligente & vérification des doublons...',
      parsingSubtitle: 'Moteur d’extraction zéro-token · Détection multi-niveaux',
      savedSuccessTitle: 'Candidature enregistrée avec succès !',
      successTitle: 'Candidature enregistrée avec succès !',
      btnViewBoard: 'Accéder au tableau de bord',
      viewDashboard: 'Accéder au tableau de bord',
      btnConfirmApplied: '🚀 Confirmer (Postulé)',
      saveApplied: '🚀 Confirmer (Postulé)',
      btnSaveForLater: '📌 Sauvegarder',
      saveSaved: '📌 Sauvegarder',
      dupWarningTitle: '{count} doublon(s) détecté(s) !',
      dupWarningDesc: 'Des offres similaires existent déjà dans votre historique :',
      dupHit: 'Niveau {level}',
      dupLastApplied: 'Postulé le {date}',
      dupCurrentStatus: 'Statut actuel',
      dupOriginalLink: 'Lien',
      dupAbandon: 'Annuler',
      dupDiscard: 'Abandonner',
      dupForce: 'Forcer l’enregistrement',
      noContentError: 'Aucun lien ou texte valide détecté.',
      emptyAlert: 'L’entreprise et le titre du poste sont requis',
      companyLabel: 'Entreprise',
      titleLabel: 'Poste',
      contractLabel: 'Contrat',
      jdLanguage: 'Langue',
      locationLabel: 'Lieu',
      salaryLabel: 'Salaire',
      postedLabel: 'Publication',
      hrLabel: 'Contact RH',
      notesLabel: 'Notes',
      originalJob: 'Voir l’offre originale',
    },
  },
  en: {
    common: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved',
      delete: 'Delete',
      deleting: 'Deleting...',
      close: 'Close',
      edit: 'Edit',
      back: 'Back',
      retry: 'Retry',
      copy: 'Copy',
      copied: 'Copied',
      unknown: 'Unknown',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      done: 'Done',
      yes: 'Yes',
      no: 'No',
    },
    header: {
      title: 'FR Job Tracker',
      subtitle: 'Zero-Token Scraper · 3-Tier Deduplication · Flash HR Lookup',
      addJob: 'Add Job',
      userAccount: 'Account',
    },
    stats: {
      total: 'Total',
      totalTooltip: 'Total records: {total} (Applied: {effective} / Saved: {saved})',
      saved: 'Saved',
      savedTooltip: 'Jobs saved for later',
      replyRate: 'Reply',
      replyRateTooltip: 'Replies ({replied}) / Active ({effective}): Share of applications that received a response',
      passRate: 'Pass',
      passRateTooltip: 'Passed ({passed}) / Active ({effective}): Share advancing to interviews or offers',
    },
    search: {
      placeholder: '☎️ Flash HR Lookup: search phone, company, title, HR name, JD keywords... (⌘K)',
      clear: 'Clear search',
      matchedCount: '{count} matching application(s) found',
    },
    status: {
      ALL: 'All Jobs',
      SAVED: 'Saved',
      APPLIED: 'Applied',
      HR_CALL: 'HR Call',
      TECH_INTERVIEW: 'Tech Interview',
      OFFER: 'Offer',
      REJECTED: 'Rejected',
      OVER_TWO_MONTHS: '> 2 Months',
      selectStatusTitle: 'Select Pipeline Status',
      statusBadgeSaved: 'Saved',
      statusBadgeApplied: 'Applied',
    },
    workMode: {
      ONSITE: 'On-site',
      HYBRID: 'Hybrid',
      REMOTE: 'Remote',
      UNSPECIFIED: 'Unspecified',
    },
    rating: {
      label: 'Rating',
      S_PLUS: 'S+ (Dream)',
      S: 'S (Key Target)',
      A_PLUS: 'A+ (Great)',
      A: 'A (Good)',
      A_MINUS: 'A- (Qualified)',
      B: 'B (Standard)',
      C: 'C (Backup)',
      SPlus: 'S+ (Dream)',
      APlus: 'A+ (Great)',
      AMinus: 'A- (Qualified)',
    },
    filter: {
      title: 'Filters',
      platform: 'Platform',
      minRating: 'Min Rating',
      contract: 'Contract',
      starredOnly: 'Starred',
      allPlatforms: 'All ({count})',
      otherPlatforms: 'Others ({count})',
      allRatings: 'All Ratings',
      allContracts: 'All Contracts',
      viewList: 'List View',
      viewGrid: 'Grid View',
      listView: 'List View',
      gridView: 'Grid View',
      list: 'List',
      grid: 'Grid',
      reset: 'Reset',
      ratingSPlus: 'S+ Only',
      ratingS: 'S & Above',
      ratingAPlus: 'A+ & Above',
      ratingA: 'A & Above',
      ratingAMinus: 'A- & Above',
      ratingB: 'B & Above',
      emptyResult: 'No matching applications found',
      emptyHint: 'Adjust your filters or click "+ Add Job" above to track a new role',
    },
    card: {
      star: 'Mark as starred',
      unstar: 'Remove star',
      edit: 'Edit application',
      delete: 'Delete record',
      deleteConfirm: 'Confirm?',
      postedDate: 'Posted',
      posted: 'Posted',
      appliedDate: 'Applied on',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{n}d ago',
      weeksAgo: '{n}w ago',
      monthsAgo: '{n}mo ago',
      recent: 'Recent',
      expandJd: 'Expand full JD',
      collapseJd: 'Collapse JD',
      jdSmartPreview: 'Smart Structured JD Preview',
      copyAll: 'Copy Full JD',
      copied: 'Copied',
      fullscreenJd: 'Fullscreen JD',
      fullscreenRead: 'Fullscreen Reader',
      originalLink: 'Original',
      salaryUnspecified: 'Salary unspecified',
      locationUnspecified: 'Location unspecified',
      details: 'Details',
      notes: 'Notes',
      overTwoMonths: '⚠️ > 2 Months',
      overTwoMonthsTooltip: 'No status update for over 60 days',
      statusMenuTitle: 'Pipeline Status',
      statusTooltip: 'Click to change status',
      loading: 'Loading applications...',
      emptyTitle: 'No matching applications found',
      emptyDesc: 'Try adjusting your filters or add a new application.',
    },
    quickAdd: {
      btnOpen: 'Add Job',
      title: 'Quick Add Application',
      subtitle: 'Paste a job URL (LinkedIn / Indeed / Apec / HelloWork) or full JD text for instant zero-token parsing',
      inputPlaceholder: 'Paste job URL (https://...) or full job description text...',
      placeholder: 'Paste job URL (https://...) or full job description text...',
      readClipboard: 'Read Clipboard',
      btnParse: 'Parse & Check Duplicates',
      parseBtn: 'Parse & Check',
      parsing: 'Parsing...',
      supportedPlatforms: 'Supports LinkedIn, Indeed FR, Apec, HelloWork, WTTJ, etc.',
      previewTitle: 'Structured Preview (Editable)',
      dupWarning: 'Duplicate application detected!',
      dupWarningTitle: '{count} potential duplicate(s) detected!',
      dupWarningDesc: 'Our L1-L3 radar detected similar or identical records in your history:',
      dupHit: 'Matched {level}',
      dupAppliedAt: 'Applied {date} ({daysAgo})',
      dupStatusAtTime: 'Status',
      dupOriginalLink: 'View history link',
      dupDiscard: 'Discard',
      dupForce: 'Confirm different, force save',
      dupHint: 'Please review historical matches before forcing submission',
      forceRecord: 'Confirm different position, force record',
      companyLabel: 'Company',
      titleLabel: 'Job Title',
      ratingLabel: 'Rating',
      initialStatusLabel: 'Initial Status',
      starredLabel: 'Starred',
      starredYes: '⭐ Starred',
      starredNo: '☆ Star this job',
      contractLabel: 'Contract Type',
      workModeLabel: 'Work Mode',
      workModeNotSpecified: 'Unspecified',
      languageLabel: 'JD Language',
      locationLabel: 'Location',
      salaryLabel: 'Salary Range',
      postedLabel: 'Posted Date',
      hrLabel: 'HR Contact',
      notesLabel: 'Notes',
      btnSaveApplied: '🚀 Save as Applied',
      btnSaveUnapplied: '📌 Save for Later',
      saveBtn: 'Save Application',
      saving: 'Saving...',
      saveSuccess: 'Saved successfully!',
      saveFailed: 'Save failed',
      emptyInputWarning: 'Please paste a job URL or description first',
      emptyAlert: 'Please paste a job URL or description first',
    },
    editModal: {
      title: 'Edit Application',
      subtitle: 'Refine and update all structured fields for this position',
      company: 'Company',
      jobTitle: 'Job Title',
      titleField: 'Job Title',
      platform: 'Platform',
      location: 'Location',
      salary: 'Salary Range',
      contract: 'Contract Type',
      contractType: 'Contract Type',
      workMode: 'Work Mode',
      workModeNotSpecified: 'Unspecified',
      language: 'Language',
      status: 'Status',
      rating: 'Rating',
      isStarred: 'Starred',
      starred: 'Starred',
      starredYes: '⭐ Starred',
      starredNo: '☆ Not starred',
      hrContact: 'HR Contact',
      hrContactPlaceholder: 'e.g., Marie · +33 6 12 34 56 78',
      notes: 'Notes & Remarks',
      notesPlaceholder: 'e.g., Resume version, referral, interview notes...',
      jdContent: 'Job Description (JD)',
      charCount: '{count} chars',
      cleanUrl: 'Original URL',
      postedAt: 'Posted Date',
      postedDate: 'Posted Date',
      appliedAt: 'Applied Date',
      appliedDate: 'Applied Date',
      saveChanges: 'Save Changes',
      save: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
      requiredAlert: 'Company and Job Title are required',
    },
    jobDetail: {
      title: 'Job Quick Preview',
      copyJd: 'Copy JD',
      copy: 'Copy',
      copied: 'Copied',
      openFullscreen: 'Fullscreen Reader',
      fullscreenRead: 'Open Fullscreen Reader',
      hrContact: 'HR Contact',
      notes: 'Notes',
      salary: 'Salary',
      location: 'Location',
      workMode: 'Work Mode',
      contractType: 'Contract',
      postedDate: 'Posted',
      appliedDate: 'Applied on',
      appliedOn: 'Applied {date} ({daysAgo})',
      originalOffer: 'View Original Listing',
      openOriginal: 'Open Original Page',
      sourcePage: 'Source',
      notSpecified: 'Unspecified',
      switchStatus: 'Quick Status Update',
      jdDetail: 'Job Description',
      editAll: 'Edit All Fields',
      deleteRecord: 'Delete',
      confirmDelete: 'Confirm?',
    },
    jdViewer: {
      title: 'Immersive JD Reader',
      copyFull: 'Copy Full Text',
      copyAll: 'Copy All',
      copied: 'Copied',
      closeTooltip: 'Close (Esc)',
      responsibilities: 'Responsibilities & Missions',
      requirements: 'Requirements & Profile',
      benefits: 'Benefits & Company Info',
      notesAndContact: 'HR Contact & Notes',
      structuredView: 'Structured View',
      tabSmart: 'Structured View',
      rawView: 'Raw Plaintext',
      tabRaw: 'Raw Plaintext',
      noContent: 'No description available',
      postedOn: 'Posted {date}',
      originalPage: 'Original Link',
      searchPlaceholder: 'Search & highlight keywords in JD...',
      matchedCount: '{count} match(es)',
    },
    login: {
      loginTitle: 'Sign In to Dashboard',
      registerTitle: 'Create an Account',
      loginSubtitle: 'Sign in to access your multi-dimensional dashboard and duplicate radar',
      registerSubtitle: 'Create your private job tracking account',
      email: 'Email Address',
      password: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      btnSignIn: 'Sign In to Dashboard',
      btnSignUp: 'Create Account',
      or: 'OR',
      googleLogin: 'Continue with Google',
      hasAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      toRegister: 'Sign up for free',
      toLogin: 'Sign in directly',
      securityNote: 'Full Row Level Security Data Isolation · Privacy Guaranteed',
      verifyingAuth: 'Verifying session...',
      emailPasswordRequired: 'Please enter your email and password',
      pwdMinLength: 'Password must be at least 6 characters',
      regSuccessEmailConfirm: 'Registration successful! Please check your email to confirm your account.',
      opFailed: 'Operation failed, please try again',
      googleFailed: 'Google sign-in failed',
      googleNotConfigured: 'Google OAuth is not enabled in your Supabase dashboard. Please enable Google Provider in Supabase, or sign up / sign in with email and password.',
      processing: 'Processing...',
    },
    account: {
      title: 'Account & Security Settings',
      currentEmail: 'Current Email',
      currentLogin: 'Signed in as',
      changePassword: 'Change Password',
      newPwdLabel: 'New Password',
      newPasswordPlaceholder: 'New password (min. 6 chars)',
      newPwdPlaceholder: 'New password (min. 6 chars)',
      confirmPwdLabel: 'Confirm New Password',
      confirmPwdPlaceholder: 'Re-enter new password',
      btnUpdatePassword: 'Update Password',
      savePwd: 'Update Password',
      savingPwd: 'Updating...',
      passwordSuccess: 'Password updated successfully',
      pwdSuccess: 'Password updated successfully!',
      pwdMinLength: 'Password must be at least 6 characters',
      pwdMismatch: 'Passwords do not match',
      pwdFailed: 'Failed to update password',
      clearDataTitle: 'Clear My Job Applications',
      clearTitle: 'Clear My Job Applications',
      clearDataDesc: 'This will permanently delete all applications under your account (keeps the account). Irreversible.',
      clearDesc: 'This will permanently delete all applications under your account (keeps the account). Irreversible.',
      clearConfirmPrompt: 'Type "{code}" to confirm deletion',
      clearPrompt: 'Type {word} to confirm clearing all records',
      clearPlaceholder: 'Type CLEAR',
      btnClearData: 'Clear All Applications',
      clearBtn: 'Clear All Records',
      clearing: 'Clearing...',
      clearSuccess: 'All your applications have been cleared!',
      clearFailed: 'Failed to clear applications',
      deleteAccountTitle: 'Permanently Delete Account',
      deleteTitle: 'Permanently Delete Account',
      deleteAccountDesc: 'This will completely erase your user profile and all associated job records. Irreversible.',
      deleteWarning: 'This will completely erase your user profile and all associated job records. Irreversible.',
      deleteConfirmPrompt: 'Type "{code}" to confirm account deletion',
      deletePrompt: 'Type {word} to confirm permanent account deletion',
      deletePlaceholder: 'Type DELETE',
      btnDeleteAccount: 'Permanently Delete My Account',
      deleteBtn: 'Delete Account',
      deleting: 'Deleting...',
      deleteFailed: 'Failed to delete account',
      signOut: 'Sign Out',
      logout: 'Sign Out',
      confirmMismatch: 'Confirmation code does not match',
    },
    share: {
      brandHeader: 'PWA Instant Share',
      title: 'PWA Instant Share',
      backToList: 'Back to Board',
      back: 'Back',
      backHomePaste: 'Back to Home to paste manually',
      parsingTitle: 'Smart parsing & duplicate checking...',
      parsingSubtitle: 'Zero-token extraction engine · Multi-level duplicate check',
      savedSuccessTitle: 'Application recorded successfully!',
      successTitle: 'Application recorded successfully!',
      btnViewBoard: 'View Board & Fast Lookup',
      viewDashboard: 'View Board & Fast Lookup',
      btnConfirmApplied: '🚀 Confirm Applied',
      saveApplied: '🚀 Confirm Applied',
      btnSaveForLater: '📌 Save for Later',
      saveSaved: '📌 Save for Later',
      dupWarningTitle: '{count} potential duplicate(s) detected!',
      dupWarningDesc: 'Similar or identical records found in your history:',
      dupHit: 'Matched {level}',
      dupLastApplied: 'Applied {date}',
      dupCurrentStatus: 'Status',
      dupOriginalLink: 'Link',
      dupAbandon: 'Abandon (Back)',
      dupDiscard: 'Discard',
      dupForce: 'Confirm Different, Force Record',
      noContentError: 'No valid job URL or text detected. Please share again from the job app.',
      emptyAlert: 'Company and Job Title are required',
      companyLabel: 'Company',
      titleLabel: 'Job Title',
      contractLabel: 'Contract',
      jdLanguage: 'JD Language',
      locationLabel: 'Location',
      salaryLabel: 'Salary',
      postedLabel: 'Posted',
      hrLabel: 'HR Contact',
      notesLabel: 'Notes',
      originalJob: 'Original Listing',
    },
  },
};
