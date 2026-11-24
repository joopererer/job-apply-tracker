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
  };
  filter: {
    platform: string;
    minRating: string;
    contract: string;
    starredOnly: string;
    allPlatforms: string;
    allRatings: string;
    allContracts: string;
    viewList: string;
    viewGrid: string;
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
    appliedDate: string;
    today: string;
    yesterday: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
    recent: string;
    expandJd: string;
    collapseJd: string;
    fullscreenJd: string;
    originalLink: string;
    salaryUnspecified: string;
    locationUnspecified: string;
    details: string;
  };
  quickAdd: {
    btnOpen: string;
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    btnParse: string;
    parsing: string;
    previewTitle: string;
    dupWarning: string;
    dupHint: string;
    forceRecord: string;
    btnSaveApplied: string;
    btnSaveUnapplied: string;
    saveSuccess: string;
    saveFailed: string;
    emptyInputWarning: string;
  };
  editModal: {
    title: string;
    company: string;
    jobTitle: string;
    location: string;
    salary: string;
    contract: string;
    workMode: string;
    language: string;
    status: string;
    rating: string;
    isStarred: string;
    hrContact: string;
    hrContactPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    jdContent: string;
    cleanUrl: string;
    postedAt: string;
    appliedAt: string;
    saveChanges: string;
  };
  jobDetail: {
    title: string;
    copyJd: string;
    copied: string;
    openFullscreen: string;
    hrContact: string;
    notes: string;
    salary: string;
    location: string;
    postedDate: string;
    appliedDate: string;
    originalOffer: string;
  };
  jdViewer: {
    title: string;
    copyFull: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
    notesAndContact: string;
    structuredView: string;
    rawView: string;
    noContent: string;
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
    changePassword: string;
    newPasswordPlaceholder: string;
    btnUpdatePassword: string;
    passwordSuccess: string;
    clearDataTitle: string;
    clearDataDesc: string;
    clearConfirmPrompt: string;
    btnClearData: string;
    deleteAccountTitle: string;
    deleteAccountDesc: string;
    deleteConfirmPrompt: string;
    btnDeleteAccount: string;
    signOut: string;
    confirmMismatch: string;
  };
  share: {
    brandHeader: string;
    backToList: string;
    parsingTitle: string;
    parsingSubtitle: string;
    savedSuccessTitle: string;
    btnViewBoard: string;
    btnConfirmApplied: string;
    btnSaveForLater: string;
    dupAbandon: string;
    dupForce: string;
    noContentError: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  zh: {
    common: {
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      saving: '保存中...',
      saved: '已保存',
      delete: '删除',
      deleting: '删除中...',
      close: '关闭',
      edit: '编辑',
      back: '返回',
      retry: '重新抓取',
      copy: '复制',
      copied: '已复制',
      unknown: '未知',
      loading: '加载中...',
      success: '成功',
      error: '错误',
      warning: '警告',
    },
    header: {
      title: 'FR Job Tracker',
      subtitle: '法国求职雷达 · 极速录入 · 状态流转 · 来电急救反查',
      addJob: '录入岗位',
      userAccount: '账号',
    },
    stats: {
      total: '总计',
      totalTooltip: '全部投递库记录: {total} 条 (有效投递: {effective}，未投递: {saved})',
      saved: '未投',
      savedTooltip: '已保存但尚未正式投递的待办岗位',
      replyRate: '回复率',
      replyRateTooltip: '回复率口径：收到有效反馈数 ÷ 有效投递数 ({replied}/{effective})\n排除未投递(SAVED)与待回复(APPLIED)，包含 HR沟通、技术面试、已获Offer与未通过等所有获得明确回复的投递',
      passRate: '通过率',
      passRateTooltip: '通过率口径：推进/通过数 ÷ 有效投递数 ({passed}/{effective})\n排除未投递(SAVED)、待回复(APPLIED)与未通过(REJECTED)，计算已成功推进到 HR沟通、技术面试或已获Offer的比例',
    },
    search: {
      placeholder: '☎️ HR 来电闪电反查：输入电话、公司名、职位、HR姓名、JD关键词...',
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
      statusBadgeSaved: '📌 先保存未投',
      statusBadgeApplied: '🚀 已直接投递',
    },
    workMode: {
      ONSITE: '现场',
      HYBRID: '混合',
      REMOTE: '远程',
      UNSPECIFIED: '未注明',
    },
    rating: {
      label: '岗位评级',
      S_PLUS: 'S+ (顶级心仪/必投)',
      S: 'S (重点目标)',
      A_PLUS: 'A+ (优质岗位)',
      A: 'A (良好机会)',
      A_MINUS: 'A- (合格/可投)',
      B: 'B (基准/海投默认)',
      C: 'C (保底/观望)',
    },
    filter: {
      platform: '平台',
      minRating: '最低评级',
      contract: '合同类型',
      starredOnly: '仅看星标',
      allPlatforms: '全部平台',
      allRatings: '全部评级',
      allContracts: '全部合同',
      viewList: '列表模式',
      viewGrid: '网格模式',
      emptyResult: '暂无符合筛选条件的岗位记录',
      emptyHint: '可点击右上角「+ 录入岗位」或使用 Chrome 插件在招聘网页一键抓取入库。',
    },
    card: {
      star: '设为特别关注 (星标)',
      unstar: '取消特别关注',
      edit: '编辑岗位',
      delete: '删除记录',
      deleteConfirm: '确定要删除这条投递记录吗？删除后不可恢复。',
      postedDate: '发布',
      appliedDate: '投递',
      today: '今天',
      yesterday: '昨天',
      daysAgo: '{n} 天前',
      weeksAgo: '{n} 周前',
      monthsAgo: '{n} 个月前',
      recent: '近期',
      expandJd: '展开完整 JD 正文',
      collapseJd: '收起正文',
      fullscreenJd: '全屏阅读 JD',
      originalLink: '原链接',
      salaryUnspecified: '薪资面议',
      locationUnspecified: '地点未注明',
      details: '详情 →',
    },
    quickAdd: {
      btnOpen: '录入岗位',
      title: '极速录入新岗位',
      subtitle: '支持一键粘贴职位链接 (URL) 或完整招聘内容，自动清洗字段并比对三级查重防撞车。',
      inputPlaceholder: '请粘贴 LinkedIn / Indeed / Apec / HelloWork 等招聘网址，或直接粘贴整段 JD 正文...',
      btnParse: '智能清洗与防重比对',
      parsing: '正在解析中...',
      previewTitle: '解析结果预览与微调',
      dupWarning: '⚠️ 检测到 {n} 条高危重复投递！',
      dupHint: '您很可能已经在该岗位或同团队职位投递过，请仔细核对避免给 HR 造成困扰。',
      forceRecord: '确认不同岗位，允许强制记录',
      btnSaveApplied: '🚀 确认直接投递 (Applied)',
      btnSaveUnapplied: '📌 先保存未投 (Saved)',
      saveSuccess: '职位记录已成功入库！',
      saveFailed: '保存失败，请重试',
      emptyInputWarning: '请先粘贴职位链接或职位招聘描述文本',
    },
    editModal: {
      title: '编辑投递记录',
      company: '公司名称',
      jobTitle: '职位名称',
      location: '工作地点',
      salary: '薪资待遇',
      contract: '合同类型',
      workMode: '办公方式',
      language: '工作语言',
      status: '当前流转状态',
      rating: '岗位评级',
      isStarred: '特别关注 (星标)',
      hrContact: 'HR 联系方式 (电话/邮箱/姓名)',
      hrContactPlaceholder: '如: 06 12 34 56 78 或 Marie Dupont',
      notes: '投递备注与笔记',
      notesPlaceholder: '如: 投递所用简历版本、内推码、面试题备忘等...',
      jdContent: '职位描述正文 (JD)',
      cleanUrl: '职位原始招聘链接',
      postedAt: '发布日期',
      appliedAt: '投递时间',
      saveChanges: '保存职位修改',
    },
    jobDetail: {
      title: '岗位详情速览',
      copyJd: '复制 JD 全文',
      copied: '已复制全文',
      openFullscreen: '全屏沉浸阅读',
      hrContact: 'HR 联系方式',
      notes: '投递备注笔记',
      salary: '薪资待遇',
      location: '工作地点',
      postedDate: '职位发布日期',
      appliedDate: '记录投递日期',
      originalOffer: '查看招聘原始网页',
    },
    jdViewer: {
      title: '全屏沉浸式 JD 阅读器',
      copyFull: '复制纯文本全文',
      responsibilities: '核心职责与工作任务 (Missions)',
      requirements: '任职要求与技能画像 (Profil / Requirements)',
      benefits: '福利待遇与公司介绍 (Avantages / About)',
      notesAndContact: 'HR 联系方式与备忘笔记',
      structuredView: '结构化视图',
      rawView: '原始纯文本',
      noContent: '暂无职位正文描述',
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
      changePassword: '修改登录密码',
      newPasswordPlaceholder: '输入新密码 (至少 6 位)',
      btnUpdatePassword: '更新密码',
      passwordSuccess: '密码修改成功',
      clearDataTitle: '清空个人投递数据',
      clearDataDesc: '此操作将永久清空您名下的所有投递记录（保留账号本身），操作不可逆。',
      clearConfirmPrompt: '请输入 "{code}" 以确认清空',
      btnClearData: '确认清空所有投递数据',
      deleteAccountTitle: '永久注销删除账号',
      deleteAccountDesc: '此操作将彻底删除您的用户身份及所有关联投递数据，无法恢复。',
      deleteConfirmPrompt: '请输入 "{code}" 以确认彻底注销',
      btnDeleteAccount: '确认永久注销并删除账号',
      signOut: '退出登录',
      confirmMismatch: '输入确认码不匹配，操作已取消',
    },
    share: {
      brandHeader: 'PWA 闪电分享录入',
      backToList: '返回列表',
      parsingTitle: '正在智能解析岗位并防重比对...',
      parsingSubtitle: '零 Token 规则引擎清洗 · 三级查重数据库核对',
      savedSuccessTitle: '已成功记录投递！',
      btnViewBoard: '查看投递看板与闪电反查',
      btnConfirmApplied: '🚀 确认记录已投递',
      btnSaveForLater: '📌 存为未投递',
      dupAbandon: '放弃重复投递 (返回)',
      dupForce: '确认不同，强制记录',
      noContentError: '未检测到分享的有效网址或文本内容。请从招聘 App 重新分享。',
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
    },
    header: {
      title: 'FR Job Tracker',
      subtitle: 'Radar de candidatures en France · Saisie express · Gestion des statuts · Recherche rapide RH',
      addJob: 'Ajouter un poste',
      userAccount: 'Compte',
    },
    stats: {
      total: 'Total',
      totalTooltip: 'Total des offres : {total} (Candidatures actives : {effective}, Sauvegardées : {saved})',
      saved: 'En attente',
      savedTooltip: 'Postes sauvegardés non encore postulés',
      replyRate: 'Taux de réponse',
      replyRateTooltip: 'Taux de réponse : Réponses obtenues ÷ Candidatures actives ({replied}/{effective})\nExclut les offres sauvegardées et en attente, inclut entretiens, offres et refus.',
      passRate: 'Taux de réussite',
      passRateTooltip: 'Taux de réussite : Candidatures qualifiées ÷ Candidatures actives ({passed}/{effective})\nExclut sauvegardés, en attente et refus, mesure les passages en entretiens et offres.',
    },
    search: {
      placeholder: '☎️ Recherche d’urgence RH : téléphone, entreprise, poste, nom du RH, mots-clés JD...',
    },
    status: {
      ALL: 'Tous les postes',
      SAVED: 'Sauvegardé',
      APPLIED: 'Postulé',
      HR_CALL: 'Échange RH',
      TECH_INTERVIEW: 'Entretien Tech',
      OFFER: 'Offre reçue',
      REJECTED: 'Refusé',
      OVER_TWO_MONTHS: 'Plus de 2 mois',
      selectStatusTitle: 'Changer le statut',
      statusBadgeSaved: '📌 Sauvegardé',
      statusBadgeApplied: '🚀 Postulé',
    },
    workMode: {
      ONSITE: 'Sur site',
      HYBRID: 'Hybride',
      REMOTE: 'Télétravail',
      UNSPECIFIED: 'Non précisé',
    },
    rating: {
      label: 'Évaluation',
      S_PLUS: 'S+ (Priorité absolue / Coup de cœur)',
      S: 'S (Cible majeure)',
      A_PLUS: 'A+ (Excellente opportunité)',
      A: 'A (Bonne opportunité)',
      A_MINUS: 'A- (Opportunité valable)',
      B: 'B (Standard / Candidature normale)',
      C: 'C (En réserve / Secondaire)',
    },
    filter: {
      platform: 'Plateforme',
      minRating: 'Note min.',
      contract: 'Type de contrat',
      starredOnly: 'Favoris seuls',
      allPlatforms: 'Toutes plateformes',
      allRatings: 'Toutes notes',
      allContracts: 'Tous contrats',
      viewList: 'Vue Liste',
      viewGrid: 'Vue Grille',
      emptyResult: 'Aucune candidature ne correspond aux critères',
      emptyHint: 'Cliquez sur « Ajouter un poste » ou utilisez l’extension Chrome pour capturer une offre.',
    },
    card: {
      star: 'Ajouter aux favoris',
      unstar: 'Retirer des favoris',
      edit: 'Modifier l’offre',
      delete: 'Supprimer',
      deleteConfirm: 'Voulez-vous vraiment supprimer cette candidature ? Cette action est irréversible.',
      postedDate: 'Publié',
      appliedDate: 'Postulé',
      today: 'Aujourd’hui',
      yesterday: 'Hier',
      daysAgo: 'Il y a {n} j',
      weeksAgo: 'Il y a {n} sem.',
      monthsAgo: 'Il y a {n} mois',
      recent: 'Récent',
      expandJd: 'Voir la description (JD)',
      collapseJd: 'Réduire',
      fullscreenJd: 'Plein écran JD',
      originalLink: 'Lien d’origine',
      salaryUnspecified: 'Salaire non précisé',
      locationUnspecified: 'Lieu non précisé',
      details: 'Détails →',
    },
    quickAdd: {
      btnOpen: 'Ajouter un poste',
      title: 'Saisie rapide d’un poste',
      subtitle: 'Collez l’URL d’une offre ou le texte complet de l’annonce pour un parsing automatique et une vérification anti-doublon.',
      inputPlaceholder: 'Collez l’URL (LinkedIn, Indeed, Apec, HelloWork...) ou le texte de l’offre...',
      btnParse: 'Analyser et vérifier les doublons',
      parsing: 'Analyse en cours...',
      previewTitle: 'Aperçu & Ajustements',
      dupWarning: '⚠️ {n} doublon(s) potentiel(s) détecté(s) !',
      dupHint: 'Vous avez probablement déjà postulé à ce poste ou au sein de la même équipe.',
      forceRecord: 'Confirmer la saisie malgré le doublon',
      btnSaveApplied: '🚀 Confirmer (Postulé)',
      btnSaveUnapplied: '📌 Sauvegarder (Non postulé)',
      saveSuccess: 'Candidature enregistrée avec succès !',
      saveFailed: 'Échec de l’enregistrement',
      emptyInputWarning: 'Veuillez coller une URL ou le texte d’une offre',
    },
    editModal: {
      title: 'Modifier la candidature',
      company: 'Entreprise',
      jobTitle: 'Intitulé du poste',
      location: 'Lieu de travail',
      salary: 'Rémunération / Salaire',
      contract: 'Contrat',
      workMode: 'Mode de travail',
      language: 'Langue de travail',
      status: 'Statut actuel',
      rating: 'Évaluation',
      isStarred: 'Favori (Étoile)',
      hrContact: 'Contact RH (tél / email / nom)',
      hrContactPlaceholder: 'Ex: 06 12 34 56 78 ou Marie Dupont',
      notes: 'Notes personnelles',
      notesPlaceholder: 'Ex: version du CV envoyé, questions posées...',
      jdContent: 'Description du poste (JD)',
      cleanUrl: 'Lien direct de l’offre',
      postedAt: 'Date de publication',
      appliedAt: 'Date de candidature',
      saveChanges: 'Enregistrer les modifications',
    },
    jobDetail: {
      title: 'Aperçu de la candidature',
      copyJd: 'Copier le descriptif',
      copied: 'Texte copié !',
      openFullscreen: 'Mode immersif plein écran',
      hrContact: 'Contact RH',
      notes: 'Notes personnelles',
      salary: 'Rémunération',
      location: 'Lieu',
      postedDate: 'Date de publication',
      appliedDate: 'Date de candidature',
      originalOffer: 'Voir l’offre originale',
    },
    jdViewer: {
      title: 'Lecteur immersif de JD',
      copyFull: 'Copier tout le texte',
      responsibilities: 'Missions & Responsabilités',
      requirements: 'Profil recherché & Compétences',
      benefits: 'Avantages & Entreprise',
      notesAndContact: 'Contact RH & Notes',
      structuredView: 'Vue structurée',
      rawView: 'Texte brut',
      noContent: 'Aucune description disponible',
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
      changePassword: 'Changer le mot de passe',
      newPasswordPlaceholder: 'Nouveau mot de passe (min. 6 car.)',
      btnUpdatePassword: 'Mettre à jour le mot de passe',
      passwordSuccess: 'Mot de passe mis à jour avec succès',
      clearDataTitle: 'Vider mes candidatures',
      clearDataDesc: 'Supprime définitivement toutes vos candidatures en conservant votre compte. Action irréversible.',
      clearConfirmPrompt: 'Tapez « {code} » pour confirmer la suppression',
      btnClearData: 'Supprimer toutes les données',
      deleteAccountTitle: 'Supprimer définitivement le compte',
      deleteAccountDesc: 'Supprime irréversiblement votre compte utilisateur et toutes les données associées.',
      deleteConfirmPrompt: 'Tapez « {code} » pour confirmer la suppression du compte',
      btnDeleteAccount: 'Supprimer définitivement mon compte',
      signOut: 'Se déconnecter',
      confirmMismatch: 'Le code de confirmation ne correspond pas',
    },
    share: {
      brandHeader: 'Saisie express via PWA',
      backToList: 'Retour',
      parsingTitle: 'Analyse intelligente & vérification des doublons...',
      parsingSubtitle: 'Moteur d’extraction zéro-token · Détection multi-niveaux',
      savedSuccessTitle: 'Candidature enregistrée avec succès !',
      btnViewBoard: 'Accéder au tableau de bord',
      btnConfirmApplied: '🚀 Confirmer (Postulé)',
      btnSaveForLater: '📌 Sauvegarder pour plus tard',
      dupAbandon: 'Annuler',
      dupForce: 'Forcer l’enregistrement',
      noContentError: 'Aucun lien ou texte valide détecté.',
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
    },
    header: {
      title: 'FR Job Tracker',
      subtitle: 'France Job Radar · Rapid Entry · Status Pipeline · HR Emergency Lookup',
      addJob: 'Add Job',
      userAccount: 'Account',
    },
    stats: {
      total: 'Total',
      totalTooltip: 'Total tracked jobs: {total} (Active applied: {effective}, Saved: {saved})',
      saved: 'Saved',
      savedTooltip: 'Jobs saved to be applied later',
      replyRate: 'Reply Rate',
      replyRateTooltip: 'Reply Rate: Received replies ÷ Active applied ({replied}/{effective})\nExcludes saved and pending, includes HR calls, interviews, offers, and rejections.',
      passRate: 'Pass Rate',
      passRateTooltip: 'Pass Rate: Advanced/Passed ÷ Active applied ({passed}/{effective})\nExcludes saved, pending, and rejections. Measures progression to interviews and offers.',
    },
    search: {
      placeholder: '☎️ HR Emergency Lookup: Phone, Company, Job Title, HR Name, JD Keywords...',
    },
    status: {
      ALL: 'All Jobs',
      SAVED: 'Saved',
      APPLIED: 'Applied',
      HR_CALL: 'HR Call',
      TECH_INTERVIEW: 'Tech Interview',
      OFFER: 'Offer Received',
      REJECTED: 'Rejected',
      OVER_TWO_MONTHS: 'Over 2 months',
      selectStatusTitle: 'Select Status',
      statusBadgeSaved: '📌 Saved',
      statusBadgeApplied: '🚀 Applied',
    },
    workMode: {
      ONSITE: 'On-site',
      HYBRID: 'Hybrid',
      REMOTE: 'Remote',
      UNSPECIFIED: 'Not specified',
    },
    rating: {
      label: 'Rating',
      S_PLUS: 'S+ (Top Priority / Dream Job)',
      S: 'S (Major Target)',
      A_PLUS: 'A+ (Great Opportunity)',
      A: 'A (Good Opportunity)',
      A_MINUS: 'A- (Acceptable)',
      B: 'B (Standard / Default)',
      C: 'C (Backup / Reserve)',
    },
    filter: {
      platform: 'Platform',
      minRating: 'Min Rating',
      contract: 'Contract',
      starredOnly: 'Starred Only',
      allPlatforms: 'All Platforms',
      allRatings: 'All Ratings',
      allContracts: 'All Contracts',
      viewList: 'List View',
      viewGrid: 'Grid View',
      emptyResult: 'No applications match your current filters',
      emptyHint: 'Click "Add Job" above or use the Chrome extension to capture jobs from any site.',
    },
    card: {
      star: 'Mark as Starred',
      unstar: 'Remove Star',
      edit: 'Edit Application',
      delete: 'Delete Application',
      deleteConfirm: 'Are you sure you want to delete this job application? This action cannot be undone.',
      postedDate: 'Posted',
      appliedDate: 'Applied',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{n}d ago',
      weeksAgo: '{n}w ago',
      monthsAgo: '{n}mo ago',
      recent: 'Recent',
      expandJd: 'Expand Full JD',
      collapseJd: 'Collapse JD',
      fullscreenJd: 'Fullscreen JD',
      originalLink: 'Original Link',
      salaryUnspecified: 'Salary not specified',
      locationUnspecified: 'Location not specified',
      details: 'Details →',
    },
    quickAdd: {
      btnOpen: 'Add Job',
      title: 'Quick Add Job',
      subtitle: 'Paste an offer URL or full JD text for automatic parsing and 3-level duplicate prevention.',
      inputPlaceholder: 'Paste LinkedIn / Indeed / Apec / HelloWork job URL or JD text...',
      btnParse: 'Smart Clean & Duplicate Check',
      parsing: 'Parsing in progress...',
      previewTitle: 'Preview & Adjustments',
      dupWarning: '⚠️ {n} Potential Duplicate(s) Found!',
      dupHint: 'You have likely already applied to this position or team before.',
      forceRecord: 'Confirm different, force save',
      btnSaveApplied: '🚀 Confirm Applied',
      btnSaveUnapplied: '📌 Save for Later',
      saveSuccess: 'Job recorded successfully!',
      saveFailed: 'Failed to record job',
      emptyInputWarning: 'Please paste a job URL or description text first',
    },
    editModal: {
      title: 'Edit Application',
      company: 'Company',
      jobTitle: 'Job Title',
      location: 'Location',
      salary: 'Salary',
      contract: 'Contract',
      workMode: 'Work Mode',
      language: 'Language',
      status: 'Current Status',
      rating: 'Rating',
      isStarred: 'Starred',
      hrContact: 'HR Contact (Phone/Email/Name)',
      hrContactPlaceholder: 'e.g. 06 12 34 56 78 or Marie Dupont',
      notes: 'Notes & Memos',
      notesPlaceholder: 'e.g. CV version used, referral code, interview notes...',
      jdContent: 'Job Description (JD)',
      cleanUrl: 'Job URL',
      postedAt: 'Posted Date',
      appliedAt: 'Applied Date',
      saveChanges: 'Save Changes',
    },
    jobDetail: {
      title: 'Job Overview',
      copyJd: 'Copy Full JD',
      copied: 'JD Copied!',
      openFullscreen: 'Fullscreen Mode',
      hrContact: 'HR Contact',
      notes: 'Notes',
      salary: 'Salary',
      location: 'Location',
      postedDate: 'Posted Date',
      appliedDate: 'Applied Date',
      originalOffer: 'Open Original Offer',
    },
    jdViewer: {
      title: 'Fullscreen JD Viewer',
      copyFull: 'Copy Full Plaintext',
      responsibilities: 'Missions & Responsibilities',
      requirements: 'Profile & Requirements',
      benefits: 'Benefits & Company Overview',
      notesAndContact: 'HR Contact & Notes',
      structuredView: 'Structured View',
      rawView: 'Raw Plaintext',
      noContent: 'No description available',
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
      changePassword: 'Change Password',
      newPasswordPlaceholder: 'New password (min. 6 chars)',
      btnUpdatePassword: 'Update Password',
      passwordSuccess: 'Password updated successfully',
      clearDataTitle: 'Clear My Job Applications',
      clearDataDesc: 'This will permanently delete all applications under your account (keeps the account). Irreversible.',
      clearConfirmPrompt: 'Type "{code}" to confirm deletion',
      btnClearData: 'Clear All Applications',
      deleteAccountTitle: 'Permanently Delete Account',
      deleteAccountDesc: 'This will completely erase your user profile and all associated job records. Irreversible.',
      deleteConfirmPrompt: 'Type "{code}" to confirm account deletion',
      btnDeleteAccount: 'Permanently Delete My Account',
      signOut: 'Sign Out',
      confirmMismatch: 'Confirmation code does not match',
    },
    share: {
      brandHeader: 'PWA Instant Share',
      backToList: 'Back to Board',
      parsingTitle: 'Smart parsing & duplicate checking...',
      parsingSubtitle: 'Zero-token extraction engine · Multi-level duplicate check',
      savedSuccessTitle: 'Application recorded successfully!',
      btnViewBoard: 'View Board & Fast Lookup',
      btnConfirmApplied: '🚀 Confirm Applied',
      btnSaveForLater: '📌 Save for Later',
      dupAbandon: 'Abandon (Back)',
      dupForce: 'Confirm Different, Force Record',
      noContentError: 'No valid job URL or text detected. Please share again from the job app.',
    },
  },
};

