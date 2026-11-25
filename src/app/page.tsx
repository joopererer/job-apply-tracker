'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  Flame,
  LayoutGrid,
  LayoutList,
  Loader2,
  MapPin,
  Maximize2,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { ApplicationRecord, supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import JdViewerModal, { FormattedJdRenderer } from '@/components/JdViewerModal';
import ApplicationEditModal from '@/components/ApplicationEditModal';
import QuickAddModal from '@/components/QuickAddModal';
import JobDetailModal from '@/components/JobDetailModal';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import { useI18n, LanguageSwitcher } from '@/lib/i18n/I18nProvider';

// 格式化投递相对时间
function formatDaysAgo(isoDate: string, t?: (k: string, p?: any) => string): string {
  if (!isoDate) return t ? t('card.recent') : '近期';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return t ? t('card.today') : '今天';
  if (diffDays === 1) return t ? t('card.yesterday') : '昨天';
  if (diffDays < 7) return t ? t('card.daysAgo', { n: diffDays }) : `${diffDays} 天前`;
  if (diffDays < 30) return t ? t('card.weeksAgo', { n: Math.floor(diffDays / 7) }) : `${Math.floor(diffDays / 7)} 周前`;
  return t ? t('card.monthsAgo', { n: Math.floor(diffDays / 30) }) : `${Math.floor(diffDays / 30)} 个月前`;
}

// 格式化发布时间 (精确到年月日，去除 ISO 时间后缀如 T00:00:00+00:00)
function formatPostedDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  return dateStr;
}

// 判断是否为投递超过 2 个月（约 60 天）
function isOverTwoMonths(isoDate?: string | null): boolean {
  if (!isoDate) return false;
  const t = new Date(isoDate).getTime();
  if (isNaN(t)) return false;
  const diffDays = (Date.now() - t) / (1000 * 60 * 60 * 24);
  return diffDays >= 60;
}

type TabStatus =
  | 'ALL'
  | 'SAVED'
  | 'APPLIED'
  | 'HR_CALL'
  | 'TECH_INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

// 状态视觉配置
const STATUS_STYLES: Record<TabStatus, { color: string; badge: string; icon: string }> = {
  ALL: { color: 'bg-slate-800 text-slate-300', badge: 'bg-slate-800', icon: '📋' },
  SAVED: { color: 'bg-slate-800 text-slate-300 border-slate-700', badge: 'bg-slate-700', icon: '📌' },
  APPLIED: { color: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/70', badge: 'bg-emerald-600', icon: '🚀' },
  HR_CALL: { color: 'bg-purple-950/90 text-purple-300 border-purple-700/70', badge: 'bg-purple-600', icon: '📞' },
  TECH_INTERVIEW: { color: 'bg-amber-950/90 text-amber-200 border-amber-600/70', badge: 'bg-amber-500', icon: '💻' },
  OFFER: { color: 'bg-emerald-700 text-emerald-100 border-emerald-400 font-extrabold shadow-sm', badge: 'bg-emerald-500', icon: '🎉' },
  REJECTED: { color: 'bg-zinc-800/90 text-zinc-400 border-zinc-700', badge: 'bg-zinc-700', icon: '❌' },
};

const STATUS_SELECT_KEYS: TabStatus[] = [
  'SAVED',
  'APPLIED',
  'HR_CALL',
  'TECH_INTERVIEW',
  'OFFER',
  'REJECTED',
];

// 卡片背景与边框色彩计算
function getCardStyle(status: string, appliedAt: string | null | undefined, isStarred: boolean) {
  const overTwoMonths = status === 'APPLIED' && isOverTwoMonths(appliedAt);

  let bgStyle = 'bg-slate-900/95 hover:bg-slate-850';
  let borderStyle = 'border-slate-800/90 hover:border-slate-700';
  let stampType: 'SUCCESS' | 'FAILED' | null = null;

  if (overTwoMonths) {
    bgStyle = 'bg-rose-950/30 hover:bg-rose-950/45';
    borderStyle = 'border-rose-900/50 hover:border-rose-700/70';
  } else if (status === 'APPLIED') {
    bgStyle = 'bg-emerald-950/35 hover:bg-emerald-950/50';
    borderStyle = 'border-emerald-700/50 hover:border-emerald-600/70';
  } else if (status === 'HR_CALL') {
    bgStyle = 'bg-purple-950/35 hover:bg-purple-950/50';
    borderStyle = 'border-purple-800/50 hover:border-purple-600/70';
  } else if (status === 'TECH_INTERVIEW') {
    bgStyle = 'bg-amber-950/40 hover:bg-amber-950/55';
    borderStyle = 'border-amber-700/50 hover:border-amber-600/70';
  } else if (status === 'OFFER') {
    bgStyle = 'bg-emerald-900/45 hover:bg-emerald-900/60';
    borderStyle = 'border-emerald-500/80 hover:border-emerald-400 shadow-xl shadow-emerald-500/20';
    stampType = 'SUCCESS';
  } else if (status === 'REJECTED') {
    bgStyle = 'bg-[#0b0e14]/90 hover:bg-[#0f131a]/95 opacity-75 hover:opacity-100';
    borderStyle = 'border-zinc-800 hover:border-zinc-700';
    stampType = 'FAILED';
  } else if (status === 'SAVED') {
    bgStyle = 'bg-slate-900/90 hover:bg-slate-850';
    borderStyle = 'border-slate-700/70 hover:border-slate-600';
  }

  // 特别关注金色高亮描边与发光
  if (isStarred) {
    borderStyle = 'border-amber-400/90 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/40';
  }

  return { bgStyle, borderStyle, overTwoMonths, stampType };
}

const PLATFORM_NAMES: Record<string, string> = {
  INDEED: 'Indeed',
  LINKEDIN: 'LinkedIn',
  APEC: 'Apec',
  HELLOWORK: 'HelloWork',
  WTTJ: 'WTTJ',
  OTHER: '其它渠道',
};

const RATING_WEIGHT: Record<string, number> = {
  'S+': 7,
  S: 6,
  'A+': 5,
  A: 4,
  'A-': 3,
  B: 2,
  C: 1,
};

const RATING_ICONS: Record<string, string> = {
  'S+': '🔥',
  S: '💎',
  'A+': '🌟',
  A: '✨',
  'A-': '⭐',
  B: '🎯',
  C: '💤',
};

function getRatingBadge(rating?: string | null) {
  const r = rating || 'B';
  const icon = RATING_ICONS[r] || '🎯';
  let badgeStyle = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  if (r === 'S+' || r === 'S') {
    badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20 font-black';
  } else if (r === 'A+' || r === 'A' || r === 'A-') {
    badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-extrabold';
  } else if (r === 'C') {
    badgeStyle = 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] border font-bold leading-none inline-flex items-center gap-0.5 shrink-0 ${badgeStyle}`}>
      <span>{icon}</span>
      <span>{r}</span>
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // 数据与列表状态
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedJdIds, setExpandedJdIds] = useState<Set<string>>(new Set());

  // 视图展示模式：列表 (list) vs 紧凑网格 (grid)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // 多维过滤条件状态
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');
  const [filterMinRating, setFilterMinRating] = useState<string>('ALL');
  const [filterStarredOnly, setFilterStarredOnly] = useState<boolean>(false);
  const [filterContract, setFilterContract] = useState<string>('ALL');

  // 顶部弹窗录入状态
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // 卡片右上角状态下拉菜单当前打开的岗位 ID
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  // 全屏沉浸式 JD 阅读弹窗状态
  const [viewerJob, setViewerJob] = useState<ApplicationRecord | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // 职位信息编辑弹窗状态
  const [editingJob, setEditingJob] = useState<ApplicationRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 网格模式点击卡片展开的详情弹窗
  const [detailJob, setDetailJob] = useState<ApplicationRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 删除确认状态 (记录正在等待二次确认的 id)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 卡片内快速复制 JD 状态
  const [copiedJdId, setCopiedJdId] = useState<string | null>(null);

  // 搜索框快捷键 Ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 状态多语言与元数据解析
  const getStatusMeta = useCallback(
    (status: TabStatus) => {
      const style = STATUS_STYLES[status] || STATUS_STYLES.APPLIED;
      return {
        ...style,
        label: t(`status.${status}`),
      };
    },
    [t]
  );

  const statusSelectOptions = useMemo(() => {
    return STATUS_SELECT_KEYS.map((key) => ({
      key,
      label: t(`status.${key}`),
      icon: STATUS_STYLES[key].icon,
    }));
  }, [t]);

  // 监听并校验用户登录态
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setCurrentUser(session.user);
      setCheckingAuth(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setCurrentUser(session.user);
        setCheckingAuth(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 全局点击自动收起状态下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.status-menu-container')) {
        setOpenStatusMenuId(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // 1. 加载所有投递记录 (附带当前用户 Token)
  const fetchApplications = useCallback(async (query = '') => {
    try {
      setLoadingList(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }
      const url = query
        ? `/api/applications?q=${encodeURIComponent(query)}`
        : '/api/applications';
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      }
    } catch {
      // 容错处理
    } finally {
      setLoadingList(false);
    }
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      fetchApplications();
    }
  }, [checkingAuth, fetchApplications]);

  // 2. 搜索框防抖处理 (优化为 180ms，兼顾灵敏度与请求频率)
  useEffect(() => {
    if (checkingAuth) return;
    const timer = setTimeout(() => {
      fetchApplications(searchQuery);
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery, checkingAuth, fetchApplications]);

  // 3. 键盘快捷键 Cmd+K / Ctrl+K 聚焦反查搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 4. 快捷切换卡片星标状态 (Optimistic UI 乐观更新)
  const handleToggleStar = async (app: ApplicationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStarred = Boolean(app.is_starred ?? app.isStarred);
    const newStarred = !currentStarred;
    const prevApps = applications;

    // 立即本地乐观更新
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, is_starred: newStarred, isStarred: newStarred } : a))
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/applications/${app.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ is_starred: newStarred }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // 失败回滚
      setApplications(prevApps);
      alert('特别关注状态更新失败，已回滚。');
    }
  };

  // 5. 更新投递状态 (流转，Optimistic UI 乐观更新)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setOpenStatusMenuId(null);
    const prevApps = applications;

    // 立即本地乐观更新
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    // 同步更新当前可能打开的详情弹窗
    if (detailJob && detailJob.id === id) {
      setDetailJob({ ...detailJob, status: newStatus });
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // 失败回滚
      setApplications(prevApps);
      alert('状态更新失败，已回滚。');
    }
  };

  // 6. 打开全屏沉浸式 JD 阅读弹窗
  const handleOpenJdViewer = (job: ApplicationRecord) => {
    setViewerJob(job);
    setIsViewerOpen(true);
  };

  // 7. 打开编辑弹窗
  const handleOpenEdit = (job: ApplicationRecord) => {
    setEditingJob(job);
    setIsEditOpen(true);
  };

  // 8. 网格模式下点击卡片打开速览详情弹窗
  const handleOpenDetail = (job: ApplicationRecord) => {
    setDetailJob(job);
    setIsDetailOpen(true);
  };

  // 9. 编辑保存后的乐观更新
  const handleJobSaved = (updatedJob: ApplicationRecord) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedJob.id ? updatedJob : app))
    );
    if (detailJob && detailJob.id === updatedJob.id) {
      setDetailJob(updatedJob);
    }
  };

  // 10. 删除职位记录 (Optimistic UI 乐观删除)
  const handleDeleteApplication = async (id: string) => {
    const prevApps = applications;
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setDeletingId(null);
    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: {
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '删除失败');
      }
    } catch (err: any) {
      // 失败回滚
      setApplications(prevApps);
      alert(`删除失败: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // 11. 复制卡片内 JD 全文
  const handleCopyCardJd = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedJdId(id);
      setTimeout(() => setCopiedJdId(null), 2000);
    } catch {
      // 容错
    }
  };

  // 12. 统计指标计算 (回复率 + 通过率 + 严格除零保护)
  const stats = useMemo(() => {
    const total = applications.length;
    const saved = applications.filter((a) => a.status === 'SAVED').length;
    // 有效投递数 = 总记录数 - 未投递(SAVED)
    const effectiveApplied = total - saved;

    // 回复数：排除「未投递（SAVED）」和「已投递（APPLIED）」后，所有其余明确反馈状态 (含 HR沟通、面试、Offer、被拒等)
    const replied = applications.filter(
      (a) => a.status !== 'SAVED' && a.status !== 'APPLIED'
    ).length;

    // 通过数：排除「未投递（SAVED）」、「已投递（APPLIED）」以及「被拒（REJECTED）」后，所有推进/通过状态 (如 HR沟通、技术面试、已获Offer)
    const passed = applications.filter(
      (a) => a.status !== 'SAVED' && a.status !== 'APPLIED' && a.status !== 'REJECTED'
    ).length;

    const replyRate = effectiveApplied > 0 ? ((replied / effectiveApplied) * 100).toFixed(0) : '0';
    const passRate = effectiveApplied > 0 ? ((passed / effectiveApplied) * 100).toFixed(0) : '0';

    return {
      total,
      saved,
      effectiveApplied,
      replied,
      passed,
      replyRate,
      passRate,
    };
  }, [applications]);

  // 计算各平台记录数量与当前有记录的平台列表
  const platformStats = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: applications.length,
      OTHER: 0,
    };
    for (const app of applications) {
      const p = (app.platform || 'OTHER').toUpperCase();
      counts[p] = (counts[p] || 0) + 1;
    }

    const standardOrder = ['INDEED', 'LINKEDIN', 'APEC', 'HELLOWORK', 'WTTJ'];
    const activeCustom = Object.keys(counts).filter(
      (k) => k !== 'ALL' && k !== 'OTHER' && counts[k] > 0
    );

    const sorted = activeCustom.sort((a, b) => {
      const idxA = standardOrder.indexOf(a);
      const idxB = standardOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return { counts, platforms: sorted };
  }, [applications]);

  // 根据当前标签与多维过滤器筛选列表
  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      // 1. 状态 Tab 过滤
      if (activeTab !== 'ALL' && a.status !== activeTab) {
        return false;
      }
      // 2. 仅看星标
      if (filterStarredOnly && !Boolean(a.is_starred ?? a.isStarred)) {
        return false;
      }
      // 3. 平台过滤
      if (filterPlatform !== 'ALL') {
        const plat = (a.platform || 'OTHER').toUpperCase();
        if (plat !== filterPlatform.toUpperCase()) return false;
      }
      // 4. 合同类型过滤
      if (filterContract !== 'ALL' && a.contract_type !== filterContract) {
        return false;
      }
      // 5. 最低评级过滤
      if (filterMinRating !== 'ALL') {
        const minWeight = RATING_WEIGHT[filterMinRating] || 0;
        const currentWeight = RATING_WEIGHT[a.rating || 'B'] || 2;
        if (currentWeight < minWeight) return false;
      }
      return true;
    });
  }, [applications, activeTab, filterStarredOnly, filterPlatform, filterContract, filterMinRating]);

  const toggleExpandJd = (id: string) => {
    setExpandedJdIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm">{t('login.verifyingAuth')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 顶部 Brand Header 与统计指标 */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2 sm:px-6 sm:py-2.5">
        <div className="max-w-5xl mx-auto grid grid-cols-[auto_1fr] items-center gap-x-2 sm:gap-x-3 gap-y-1.5">
          {/* 第 1 行左侧：Logo + 标题 */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="/icons/icon-192.png"
              alt="Logo"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl object-cover shadow-lg shadow-blue-500/20"
            />
            <div className="flex items-center gap-1">
              <h1 className="font-extrabold text-sm sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
                {t('header.title')}
              </h1>
              <span className="text-xs sm:text-sm">🇫🇷</span>
            </div>
          </div>

          {/* 第 1 行右侧：统计指标（总计/回复率/通过率 始终一行紧凑） */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap justify-self-end text-[10px] sm:text-xs">
            {/* 总岗位 */}
            <div
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-1 whitespace-nowrap"
              title={t('stats.totalTooltip', { total: stats.total, effective: stats.effectiveApplied, saved: stats.saved })}
            >
              <span className="text-slate-400">{t('stats.total')}:</span>
              <strong className="text-blue-400 font-bold">{stats.total}</strong>
            </div>

            {/* 未投递微标 (桌面端大于0时显示) */}
            {stats.saved > 0 && (
              <div
                className="px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 items-center gap-1 hidden md:flex whitespace-nowrap"
                title={t('stats.savedTooltip')}
              >
                <span className="text-amber-400 font-bold">📌 {t('stats.saved')}:</span>
                <strong className="text-amber-300 font-bold">{stats.saved}</strong>
              </div>
            )}

            {/* 回复率核心指标 */}
            <div
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-1 cursor-help whitespace-nowrap"
              title={t('stats.replyRateTooltip', { replied: stats.replied, effective: stats.effectiveApplied })}
            >
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300">{t('stats.replyRate')}:</span>
              <strong className="text-emerald-400 font-bold">
                {stats.effectiveApplied > 0 ? `${stats.replyRate}%` : '—'}
              </strong>
            </div>

            {/* 通过率核心指标 */}
            <div
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center gap-1 cursor-help whitespace-nowrap"
              title={t('stats.passRateTooltip', { passed: stats.passed, effective: stats.effectiveApplied })}
            >
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
              <span className="text-indigo-300">{t('stats.passRate')}:</span>
              <strong className="text-indigo-400 font-bold">
                {stats.effectiveApplied > 0 ? `${stats.passRate}%` : '—'}
              </strong>
            </div>
          </div>

          {/* 第 2 行左侧：语言下拉切换器（与右侧 + 按钮水平中线严格对齐） */}
          <div className="flex items-center gap-2 justify-self-start">
            <LanguageSwitcher />
            <p className="text-[11px] text-slate-400 hidden lg:block">
              {t('header.subtitle')}
            </p>
          </div>

          {/* 第 2 行右侧：录入按钮（移动端仅保留+图标） + 用户账号按钮 */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-self-end">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              title={t('header.addJob')}
              className="py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1 transition shadow-lg shadow-blue-500/25 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('header.addJob')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 active:scale-95 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              title={t('account.title')}
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate">
                {currentUser?.email ? currentUser.email.split('@')[0] : t('header.userAccount')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* ============================================================== */}
        {/* 中部「☎️ HR 来电闪电反查搜索框」 */}
        {/* ============================================================== */}
        <section className="space-y-1.5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full pl-9 sm:pl-11 pr-9 sm:pr-14 py-2 sm:py-2.5 bg-slate-900/90 border border-amber-500/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 shadow-xl transition"
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
          {searchQuery && (
            <div className="text-xs text-amber-300/80 px-2 flex items-center justify-between">
              <span>{t('search.matchedCount', { count: filteredApplications.length })}</span>
              <button
                onClick={() => setSearchQuery('')}
                className="underline hover:text-white"
              >
                {t('search.clear')}
              </button>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* 底部「多维过滤、视图切换、状态 Tab 与列表/网格渲染」 */}
        {/* ============================================================== */}
        <section className="space-y-2.5">
          {/* 多维快捷筛选工具栏 + 视图模式切换 (单行紧凑，列表/网格靠右) */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] sm:text-xs flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0" />

              {/* 平台筛选 */}
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-1.5 sm:px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer shrink-0"
              >
                <option value="ALL">{t('filter.allPlatforms', { count: platformStats.counts.ALL || 0 })}</option>
                {platformStats.platforms.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_NAMES[p] || p} ({platformStats.counts[p] || 0})
                  </option>
                ))}
                {!platformStats.platforms.includes(filterPlatform) &&
                  filterPlatform !== 'ALL' &&
                  filterPlatform !== 'OTHER' && (
                    <option value={filterPlatform}>
                      {PLATFORM_NAMES[filterPlatform] || filterPlatform} (0)
                    </option>
                  )}
                <option value="OTHER">{t('filter.otherPlatforms', { count: platformStats.counts.OTHER || 0 })}</option>
              </select>

              {/* 最低评级筛选 */}
              <select
                value={filterMinRating}
                onChange={(e) => setFilterMinRating(e.target.value)}
                className="px-1.5 sm:px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer shrink-0"
              >
                <option value="ALL">{t('filter.allRatings')}</option>
                <option value="S+">{t('filter.ratingSPlus')}</option>
                <option value="S">{t('filter.ratingS')}</option>
                <option value="A+">{t('filter.ratingAPlus')}</option>
                <option value="A">{t('filter.ratingA')}</option>
                <option value="A-">{t('filter.ratingAMinus')}</option>
                <option value="B">{t('filter.ratingB')}</option>
              </select>

              {/* 合同类型筛选 */}
              <select
                value={filterContract}
                onChange={(e) => setFilterContract(e.target.value)}
                className="px-1.5 sm:px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer shrink-0"
              >
                <option value="ALL">{t('filter.allContracts')}</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="FREELANCE">Freelance</option>
                <option value="STAGE">Stage</option>
                <option value="ALTERNANCE">Alternance</option>
              </select>

              {/* 仅看星标开关 */}
              <button
                type="button"
                onClick={() => setFilterStarredOnly((v) => !v)}
                title={t('filter.starredOnly')}
                className={`px-2 py-1 rounded-lg border font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                  filterStarredOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterStarredOnly ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{t('filter.starredOnly')}</span>
              </button>

              {/* 重置筛选 */}
              {(filterPlatform !== 'ALL' || filterMinRating !== 'ALL' || filterContract !== 'ALL' || filterStarredOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterPlatform('ALL');
                    setFilterMinRating('ALL');
                    setFilterContract('ALL');
                    setFilterStarredOnly(false);
                  }}
                  title={t('filter.reset')}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('filter.reset')}</span>
                </button>
              )}
            </div>

            {/* 视图模式切换：列表 (List) 与 紧凑网格 (Grid) 置于同一行末尾 */}
            <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('filter.listView')}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('filter.list')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('filter.gridView')}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('filter.grid')}</span>
              </button>
            </div>
          </div>

          {/* 状态流转 Tab 切换 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                'ALL',
                'SAVED',
                'APPLIED',
                'HR_CALL',
                'TECH_INTERVIEW',
                'OFFER',
                'REJECTED',
              ] as TabStatus[]
            ).map((tab) => {
              const meta = getStatusMeta(tab);
              const count =
                tab === 'ALL'
                  ? applications.length
                  : applications.filter((a) => a.status === tab).length;

              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    active
                      ? `${meta.badge} text-white shadow-md`
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 数据加载状态 */}
          {loadingList ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs">{t('card.loading')}</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2 rounded-2xl bg-slate-900/40 border border-slate-800">
              <Building2 className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">{t('card.emptyTitle')}</p>
              <p className="text-xs text-slate-600">
                {t('card.emptyDesc')}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            /* ============================================================== */
            /* 1. 列表模式 (瘦身优化版，移除底部按钮，右上角状态按需下拉) */
            /* ============================================================== */
            <div className="space-y-2.5">
              {filteredApplications.map((app) => {
                const isExpanded = expandedJdIds.has(app.id);
                const currentStatus = (app.status || 'APPLIED') as TabStatus;
                const statusMeta = getStatusMeta(currentStatus);

                // HR 联系方式解析
                let hrText = '';
                if (app.hr_contact) {
                  if (typeof app.hr_contact === 'string') hrText = app.hr_contact;
                  else if (typeof app.hr_contact === 'object') {
                    const c: any = app.hr_contact;
                    hrText = [c.name, c.phone, c.email].filter(Boolean).join(' · ') || c.raw || '';
                  }
                }

                const isStarred = Boolean(app.is_starred ?? app.isStarred);
                const { bgStyle, borderStyle, overTwoMonths, stampType } = getCardStyle(
                  currentStatus,
                  app.applied_at,
                  isStarred
                );

                const isMenuOpen = openStatusMenuId === app.id;

                return (
                  <div
                    key={app.id}
                    className={`p-3.5 sm:p-4 rounded-2xl ${bgStyle} border ${borderStyle} transition space-y-2.5 shadow-md relative ${isMenuOpen ? 'z-40' : 'z-10'}`}
                  >
                    {/* 水印盖章效果 (OFFER 成功章 / REJECTED 失败章) */}
                    {stampType === 'SUCCESS' && (
                      <div className="absolute right-36 top-3 pointer-events-none select-none opacity-80 transform -rotate-12 border-2 border-dashed border-emerald-400 text-emerald-200 bg-emerald-950/60 font-black tracking-widest text-[11px] sm:text-xs px-2.5 py-0.5 rounded uppercase shadow-lg shadow-emerald-500/20">
                        🎉 OFFER · SUCCESS
                      </div>
                    )}
                    {stampType === 'FAILED' && (
                      <div className="absolute right-36 top-3 pointer-events-none select-none opacity-85 transform -rotate-12 border-2 border-dashed border-zinc-400 text-zinc-100 bg-zinc-950/85 font-black tracking-widest text-[11px] sm:text-xs px-2.5 py-0.5 rounded uppercase shadow-lg shadow-black/40">
                        ✕ FAILED · {t('status.REJECTED')}
                      </div>
                    )}

                    {/* 卡片头部区域：左侧公司+标签+职位通栏，右侧状态流转与第二行投递时间 */}
                    <div className="flex items-start justify-between gap-3">
                      {/* 左侧主要信息 */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* 空间足够时跟在公司名后 + 空间不足自动折行 */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-sm sm:text-base font-black text-slate-100 shrink-0"
                            title={app.company_raw}
                          >
                            {app.company_raw}
                          </span>

                          {/* 所有 Tags（高度与其他 tag 严格对齐） */}
                          {getRatingBadge(app.rating)}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border leading-none inline-flex items-center shrink-0 ${
                              app.contract_type === 'CDD'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : app.contract_type === 'FREELANCE'
                                ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                : app.contract_type === 'STAGE'
                                ? 'bg-pink-500/15 text-pink-400 border-pink-500/30'
                                : app.contract_type === 'ALTERNANCE'
                                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                : app.contract_type === 'UNKNOWN'
                                ? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {app.contract_type || 'UNKNOWN'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 leading-none inline-flex items-center shrink-0">
                            {app.language === 'FR' ? 'FR' : 'EN'}
                          </span>
                          {app.work_mode && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 leading-none inline-flex items-center shrink-0">
                              {app.work_mode === 'ONSITE' ? `🏢 ${t('workMode.ONSITE')}` : app.work_mode === 'HYBRID' ? `🔄 ${t('workMode.HYBRID')}` : `🏠 ${t('workMode.REMOTE')}`}
                            </span>
                          )}
                          {app.platform && app.platform !== 'OTHER' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 leading-none inline-flex items-center shrink-0">
                              {app.platform}
                            </span>
                          )}
                        </div>

                        {/* 岗位名称通栏展示，超宽再自然换行 */}
                        <h4
                          className="text-xs sm:text-sm font-semibold text-slate-200 w-full break-words leading-snug"
                          title={app.title_raw}
                        >
                          {app.title_raw}
                        </h4>
                      </div>

                      {/* 右侧：第一行操作按钮 + 第二行右侧投递时间 */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        {/* 第一行右侧：状态按需展开徽章 + 星标 + 编辑 + 删除 */}
                        <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
                          {overTwoMonths && (
                            <span
                              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/50"
                              title={t('card.overTwoMonthsTooltip')}
                            >
                              {t('card.overTwoMonths')}
                            </span>
                          )}

                          {/* 右上角状态按需下拉菜单 */}
                          <div className="relative status-menu-container">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenStatusMenuId(isMenuOpen ? null : app.id);
                              }}
                              className={`px-2 py-0.5 rounded-full text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${statusMeta.color}`}
                              title={t('card.statusTooltip')}
                            >
                              <span>{statusMeta.icon}</span>
                              <span>{statusMeta.label}</span>
                              <ChevronDown className="w-3 h-3 opacity-70" />
                            </button>

                            {/* 展开的状态选择菜单（置顶高 z-50 避免被遮挡） */}
                            {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                  {t('card.statusMenuTitle')}
                                </div>
                                {statusSelectOptions.map((opt) => {
                                  const selected = app.status === opt.key;
                                  return (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateStatus(app.id, opt.key);
                                      }}
                                      className={`w-full px-2.5 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition ${
                                        selected
                                          ? 'bg-blue-600/30 text-blue-300'
                                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                      }`}
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <span>{opt.icon}</span>
                                        <span>{opt.label}</span>
                                      </span>
                                      {selected && <Check className="w-3 h-3 text-blue-400" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* 特别关注 ⭐ 切换按钮 */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(app, e)}
                            className={`p-1 rounded-lg transition ${
                              isStarred
                                ? 'text-amber-400 bg-amber-500/15 hover:bg-amber-500/25'
                                : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                            }`}
                            title={isStarred ? t('card.unstar') : t('card.star')}
                          >
                            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>

                          {/* 编辑按钮 */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(app)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
                            title={t('card.edit')}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* 删除按钮与确认 */}
                          {deletingId === app.id ? (
                            <div className="inline-flex items-center gap-1 bg-rose-950/80 border border-rose-800 px-1.5 py-0.5 rounded-lg text-[10px] animate-in fade-in">
                              <span className="text-rose-300 font-bold">{t('card.deleteConfirm')}</span>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteApplication(app.id)}
                                className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition"
                              >
                                {t('common.yes')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition"
                              >
                                {t('common.no')}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(app.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                              title={t('card.delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* 第二行右侧：投递相对时间 (昨天/2天前 等) */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-end pt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatDaysAgo(app.applied_at, t)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 地点、薪资、发布与 HR 联系人反查信息 */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 flex-wrap">
                      {app.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{app.location}</span>
                        </div>
                      )}

                      {app.salary_range && (
                        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <span>💰 {app.salary_range}</span>
                        </div>
                      )}

                      {(app.posted_at || app.postedAt) && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>
                            {t('card.posted')}: {formatPostedDate(app.posted_at || app.postedAt)}
                          </span>
                        </div>
                      )}

                      {hrText && (
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded-lg border border-amber-500/20">
                          <Phone className="w-3 h-3" />
                          <span>HR: {hrText}</span>
                        </div>
                      )}

                      {app.clean_url && (
                        <a
                          href={app.clean_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto inline-flex items-center gap-1 text-blue-400 hover:underline"
                        >
                          {t('card.originalLink')} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* 备注笔记 */}
                    {app.notes && (
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                        <strong className="text-slate-400 font-medium">{t('card.notes')}: </strong>
                        {app.notes}
                      </div>
                    )}

                    {/* 可折叠展开的结构化 JD 预览与全屏阅读器 */}
                    {app.jd_content && (
                      <div className="pt-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpandJd(app.id)}
                            className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition"
                          >
                            {isExpanded ? (
                              <>
                                <span>{t('card.collapseJd')}</span>
                                <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                <span>{t('card.expandJd')}</span>
                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenJdViewer(app)}
                            className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition font-semibold"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>{t('card.fullscreenJd')}</span>
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5">
                              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-blue-400" />
                                {t('card.jdSmartPreview')}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyCardJd(app.id, app.jd_content || '')}
                                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700/60 transition flex items-center gap-1"
                                >
                                  {copiedJdId === app.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">{t('card.copied')}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-400" />
                                      <span>{t('card.copyAll')}</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenJdViewer(app)}
                                  className="px-2 py-0.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-[11px] font-bold text-blue-300 border border-blue-500/30 transition flex items-center gap-1"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>{t('card.fullscreenRead')}</span>
                                </button>
                              </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto pr-1">
                              <FormattedJdRenderer content={app.jd_content} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ============================================================== */
            /* 2. 紧凑网格模式 (Grid: 手机2列、桌面3~4列，精简信息+点击卡片展开详情) */
            /* ============================================================== */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredApplications.map((app) => {
                const currentStatus = (app.status || 'APPLIED') as TabStatus;
                const statusMeta = getStatusMeta(currentStatus);
                const isStarred = Boolean(app.is_starred ?? app.isStarred);
                const { bgStyle, borderStyle, stampType } = getCardStyle(
                  currentStatus,
                  app.applied_at,
                  isStarred
                );
                const isMenuOpen = openStatusMenuId === app.id;

                return (
                  <div
                    key={app.id}
                    onClick={() => handleOpenDetail(app)}
                    className={`p-2.5 sm:p-3 rounded-2xl ${bgStyle} border ${borderStyle} transition space-y-2 shadow-md relative cursor-pointer flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] group ${isMenuOpen ? 'z-40' : 'z-10'}`}
                  >
                    {/* 水印盖章效果 (OFFER 成功章 / REJECTED 失败章) */}
                    {stampType === 'SUCCESS' && (
                      <div className="absolute right-2 bottom-6 pointer-events-none select-none opacity-40 transform -rotate-12 border border-dashed border-emerald-400 text-emerald-200 bg-emerald-950/60 font-black tracking-widest text-[9px] px-1.5 py-0.2 rounded uppercase">
                        OFFER
                      </div>
                    )}
                    {stampType === 'FAILED' && (
                      <div className="absolute right-2 bottom-6 pointer-events-none select-none opacity-45 transform -rotate-12 border border-dashed border-zinc-400 text-zinc-100 bg-zinc-950/85 font-black tracking-widest text-[9px] px-1.5 py-0.2 rounded uppercase">
                        REJECTED
                      </div>
                    )}

                    {/* 网格卡片顶部：星标 ⭐ + 评级 + 状态切换 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(app, e)}
                            className={`p-1 rounded-lg transition ${
                              isStarred
                                ? 'text-amber-400 bg-amber-500/15 hover:bg-amber-500/25'
                                : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                            }`}
                            title={isStarred ? t('card.unstar') : t('card.star')}
                          >
                            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                          {getRatingBadge(app.rating)}
                        </div>

                        {/* 右上角状态徽章 (点击可下拉选择) */}
                        <div className="relative status-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusMenuId(isMenuOpen ? null : app.id);
                            }}
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition flex items-center gap-0.5 cursor-pointer ${statusMeta.color}`}
                            title={t('card.statusTooltip')}
                          >
                            <span>{statusMeta.icon}</span>
                            <span className="hidden sm:inline">{statusMeta.label}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                              {statusSelectOptions.map((opt) => (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(app.id, opt.key);
                                  }}
                                  className={`w-full px-2 py-1 text-left text-[11px] font-semibold flex items-center justify-between ${
                                    app.status === opt.key
                                      ? 'bg-blue-600/30 text-blue-300'
                                      : 'text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <span>{opt.icon} {opt.label}</span>
                                  {app.status === opt.key && <Check className="w-3 h-3 text-blue-400" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 公司名与职位 */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-100 truncate" title={app.company_raw}>
                          {app.company_raw}
                        </h4>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug mt-0.5 font-medium" title={app.title_raw}>
                          {app.title_raw}
                        </p>
                      </div>
                    </div>

                    {/* 网格卡片底部：标签元数据 + 投递天数 */}
                    <div className="pt-1.5 border-t border-slate-800/60 space-y-1">
                      <div className="flex items-center gap-1 flex-wrap text-[10px]">
                        <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                          {app.contract_type || 'CDI'}
                        </span>
                        {app.work_mode && (
                          <span className="px-1 py-0.2 rounded bg-purple-950/60 text-purple-300 font-semibold border border-purple-800/40">
                            {app.work_mode === 'ONSITE' ? t('workMode.ONSITE') : app.work_mode === 'HYBRID' ? t('workMode.HYBRID') : t('workMode.REMOTE')}
                          </span>
                        )}
                        {app.location && (
                          <span className="text-slate-400 truncate max-w-[80px]" title={app.location}>
                            📍 {app.location}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>{formatDaysAgo(app.applied_at, t)}</span>
                        </span>
                        <span className="text-blue-400 group-hover:underline text-[10px] font-semibold">
                          {t('card.details')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 极速录入弹窗 (Modal) */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => fetchApplications()}
      />

      {/* 网格模式岗位详情速览弹窗 */}
      <JobDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        job={detailJob}
        onEdit={(job) => handleOpenEdit(job)}
        onViewJd={(job) => handleOpenJdViewer(job)}
        onToggleStar={handleToggleStar}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteApplication}
      />

      {/* 全屏沉浸式 JD 阅读弹窗 */}
      <JdViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        job={viewerJob}
      />

      {/* 职位信息完整编辑弹窗 */}
      <ApplicationEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        job={editingJob}
        onSaved={handleJobSaved}
      />

      {/* 账号与安全设置弹窗 */}
      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        userEmail={currentUser?.email || null}
        onDataCleared={() => fetchApplications()}
      />
    </div>
  );
}
