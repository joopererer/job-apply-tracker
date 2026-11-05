'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  Globe,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { ScrapedJob } from '@/lib/scraper';
import { ApplicationRecord, DuplicateCheckResult } from '@/lib/supabase';

// 格式化投递相对时间
function formatDaysAgo(isoDate: string): string {
  if (!isoDate) return '近期';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  return `${Math.floor(diffDays / 30)} 个月前`;
}

type TabStatus =
  | 'ALL'
  | 'APPLIED'
  | 'HR_CALL'
  | 'TECH_INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

const STATUS_LABELS: Record<TabStatus, { label: string; color: string; badge: string }> = {
  ALL: { label: '全部投递', color: 'bg-slate-800 text-slate-300', badge: 'bg-slate-800' },
  APPLIED: { label: '已投递', color: 'bg-blue-900/60 text-blue-300 border-blue-700/60', badge: 'bg-blue-600' },
  HR_CALL: { label: 'HR 沟通', color: 'bg-amber-900/60 text-amber-300 border-amber-700/60', badge: 'bg-amber-500' },
  TECH_INTERVIEW: { label: '技术面试', color: 'bg-purple-900/60 text-purple-300 border-purple-700/60', badge: 'bg-purple-600' },
  OFFER: { label: '已获 Offer', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60', badge: 'bg-emerald-500' },
  REJECTED: { label: '未通过', color: 'bg-rose-950/60 text-rose-300 border-rose-800/60', badge: 'bg-rose-600' },
};

export default function HomePage() {
  // 数据与列表状态
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedJdIds, setExpandedJdIds] = useState<Set<string>>(new Set());

  // 顶部极速录入栏状态
  const [inputContent, setInputContent] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedJob, setParsedJob] = useState<ScrapedJob | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateCheckResult[]>([]);
  const [forceRecordAllowed, setForceRecordAllowed] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  // 表单微调状态
  const [editCompany, setEditCompany] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContract, setEditContract] = useState<'CDI' | 'CDD' | 'OTHER'>('CDI');
  const [editLang, setEditLang] = useState<'FR' | 'EN'>('FR');
  const [editLocation, setEditLocation] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editPostedAt, setEditPostedAt] = useState('');
  const [editHr, setEditHr] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // 搜索框快捷键 Ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. 加载所有投递记录
  const fetchApplications = async (query = '') => {
    try {
      setLoadingList(true);
      const url = query
        ? `/api/applications?q=${encodeURIComponent(query)}`
        : '/api/applications';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      }
    } catch {
      // 容错处理
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // 2. 搜索框防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications(searchQuery);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // 4. 一键读取系统剪贴板 (手机端体验优化)
  const handleReadClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        alert('您的浏览器不支持直接读取剪贴板，请手动在输入框内长按粘贴。');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputContent(text.trim());
        triggerParseAndCheck(text.trim());
      } else {
        alert('剪贴板中无内容，请先复制岗位链接或招聘文本。');
      }
    } catch (err: any) {
      alert('无法访问剪贴板，请在输入框内手动粘贴。');
    }
  };

  // 5. 触发解析与查重
  const triggerParseAndCheck = async (content = inputContent) => {
    const trimmed = content.trim();
    if (!trimmed) {
      setParseError('请输入或粘贴求职网址、或者岗位分享文本。');
      return;
    }

    setParsing(true);
    setParseError(null);
    setParsedJob(null);
    setDuplicates([]);
    setForceRecordAllowed(false);

    try {
      let url: string | undefined;
      let rawText: string | undefined = trimmed;

      const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
      if (urlMatch) {
        url = urlMatch[0];
      }

      const res = await fetch('/api/parse-and-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '解析失败，请检查链接');
      }

      const job: ScrapedJob = data.parsedJob;
      setParsedJob(job);
      setDuplicates(data.duplicates || []);

      // 初始化微调表单
      setEditCompany(job.companyRaw || '');
      setEditTitle(job.titleRaw || '');
      setEditContract(job.contractType || 'CDI');
      setEditLang(job.language || 'FR');
      setEditLocation(job.location || '');
      setEditSalary(job.salaryRange || '');
      setEditPostedAt(job.postedAt || '');
    } catch (err: any) {
      setParseError(err.message || '网络连接或解析异常');
    } finally {
      setParsing(false);
    }
  };

  // 6. 保存新投递记录
  const handleSaveApplication = async () => {
    if (!parsedJob) return;
    setSavingRecord(true);
    try {
      const payload = {
        ...parsedJob,
        companyRaw: editCompany,
        titleRaw: editTitle,
        contractType: editContract,
        language: editLang,
        location: editLocation || null,
        salaryRange: editSalary || null,
        postedAt: editPostedAt || null,
        notes: editNotes || null,
        hrContact: editHr ? { phone: editHr, raw: editHr } : null,
        status: 'APPLIED',
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '保存失败');
      }

      // 重置录入框并刷新列表
      setInputContent('');
      setParsedJob(null);
      setDuplicates([]);
      setEditNotes('');
      setEditHr('');
      await fetchApplications();
    } catch (err: any) {
      alert(`保存失败: ${err.message}`);
    } finally {
      setSavingRecord(false);
    }
  };

  // 7. 更新投递状态 (流转)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
      }
    } catch {
      alert('状态更新失败，请稍后重试');
    }
  };

  // 统计数据
  const stats = useMemo(() => {
    const total = applications.length;
    const hrCalls = applications.filter((a) => a.status === 'HR_CALL').length;
    const interviews = applications.filter((a) => a.status === 'TECH_INTERVIEW').length;
    const offers = applications.filter((a) => a.status === 'OFFER').length;
    const positiveReplies = hrCalls + interviews + offers;
    const replyRate = total > 0 ? ((positiveReplies / total) * 100).toFixed(0) : '0';
    return { total, hrCalls, interviews, offers, replyRate };
  }, [applications]);

  // 根据当前标签筛选列表
  const filteredApplications = useMemo(() => {
    if (activeTab === 'ALL') return applications;
    return applications.filter((a) => a.status === activeTab);
  }, [applications, activeTab]);

  const toggleExpandJd = (id: string) => {
    setExpandedJdIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 顶部 Brand Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  FR Job Tracker
                </h1>
                <span className="text-sm">🇫🇷</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                零 Token 法国求职雷达 · 剪贴板闪电防重与来电急救反查
              </p>
            </div>
          </div>

          {/* 实时统计微标 */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-1.5">
              <span className="text-slate-400">总投递:</span>
              <strong className="text-blue-400 font-bold">{stats.total}</strong>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">回复率:</span>
              <strong className="text-emerald-400 font-bold">{stats.replyRate}%</strong>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ============================================================== */}
        {/* 模块一：顶部「极速录入与剪贴板解析栏」 */}
        {/* ============================================================== */}
        <section className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
                极速录入与智能防重
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              支持 Apec · Indeed · HelloWork · LinkedIn · WTTJ
            </span>
          </div>

          {/* 输入框与一键粘贴按钮 */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                rows={2}
                value={inputContent}
                placeholder="粘贴法国招聘岗位 URL 或 App 分享的全部文本..."
                onChange={(e) => setInputContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
              />
              {inputContent && (
                <button
                  type="button"
                  onClick={() => setInputContent('')}
                  className="absolute right-2.5 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 操作按钮组 (移动端单手操作优化) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleReadClipboard}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700/70"
              >
                <Clipboard className="w-4 h-4 text-blue-400" />
                <span>📋 读取剪贴板</span>
              </button>

              <button
                type="button"
                onClick={() => triggerParseAndCheck()}
                disabled={parsing || !inputContent.trim()}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 active:scale-98 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/20"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>解析查重中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>⚡ 解析并查重</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {parseError && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* 解析后展开的微调预览表单 */}
          {parsedJob && (
            <div className="pt-3 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
              {/* ⚠️ 醒目防重警告 */}
              {duplicates.length > 0 && !forceRecordAllowed ? (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/80 to-red-950/70 border-2 border-amber-500/80 shadow-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-200">
                        ⚠️ 警告：检测到 {duplicates.length} 条高危重复历史投递！
                      </h3>
                      <p className="text-xs text-amber-300/80 mt-0.5">
                        防止短时间内重复投递同团队职位，避免给 HR 带来糟糕体验。
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {duplicates.map((dup, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/90 border border-amber-600/40 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {dup.level} 命中
                          </span>
                          <span className="text-slate-400">
                            投递于: {dup.matchedApplication?.applied_at?.slice(0, 10)} (
                            {formatDaysAgo(dup.matchedApplication?.applied_at || '')})
                          </span>
                        </div>
                        <p className="font-semibold text-slate-100 text-sm">
                          {dup.matchedApplication?.company_raw} - {dup.matchedApplication?.title_raw}
                        </p>
                        <p className="text-amber-200">{dup.reason}</p>
                        <div className="flex items-center justify-between text-slate-400 pt-1">
                          <span>
                            当时状态: <strong className="text-slate-200">{dup.matchedApplication?.status}</strong>
                          </span>
                          {dup.matchedApplication?.clean_url && (
                            <a
                              href={dup.matchedApplication.clean_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                              历史投递链接 <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setParsedJob(null);
                        setDuplicates([]);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      放弃重复投递 (清除)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForceRecordAllowed(true)}
                      className="py-2.5 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/50 text-xs font-bold transition"
                    >
                      仍然强制记录
                    </button>
                  </div>
                </div>
              ) : null}

              {/* 字段编辑网格 */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      公司名称 (Company)
                    </label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      职位名称 (Title)
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* 合同类型切换 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      合同类型
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['CDI', 'CDD', 'OTHER'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEditContract(t)}
                          className={`py-1 text-xs font-bold rounded-lg transition ${
                            editContract === t
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 语言切换 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      JD 语言
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['FR', 'EN'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setEditLang(l)}
                          className={`py-1 text-xs font-bold rounded-lg transition ${
                            editLang === l
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {l === 'FR' ? '🇫🇷 法语' : '🇬🇧 英语'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 工作地点 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      工作地点
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      placeholder="如: Paris"
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 薪资范围 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      薪资范围
                    </label>
                    <input
                      type="text"
                      value={editSalary}
                      placeholder="如: 50k - 60k €"
                      onChange={(e) => setEditSalary(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      发布日期 (Posted Date)
                    </label>
                    <input
                      type="text"
                      value={editPostedAt}
                      placeholder="如: 2026-10-25 或 1 周前"
                      onChange={(e) => setEditPostedAt(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      HR 联系电话/姓名 (便于反查)
                    </label>
                    <input
                      type="text"
                      value={editHr}
                      placeholder="如: 06 12 34 56 78 或 Marie"
                      onChange={(e) => setEditHr(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      投递备注笔记
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      placeholder="如: 内推员工姓名、自荐信版本..."
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 提交按钮 */}
                <button
                  type="button"
                  onClick={handleSaveApplication}
                  disabled={savingRecord || (duplicates.length > 0 && !forceRecordAllowed)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
                    duplicates.length > 0 && !forceRecordAllowed
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {savingRecord ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在保存...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      确认并加入投递看板
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* 模块二：中部「☎️ HR 来电闪电反查搜索框」 */}
        {/* ============================================================== */}
        <section className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <PhoneCall className="w-5 h-5 text-amber-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="☎️ HR 来电闪电反查：输入电话、公司名、职位、HR姓名、JD关键词..."
              className="w-full pl-11 pr-24 py-3.5 bg-slate-900/90 border border-amber-500/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 rounded-2xl text-sm sm:text-base text-slate-100 placeholder-slate-400 shadow-xl transition"
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
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
          {searchQuery && (
            <div className="text-xs text-amber-300/80 px-2 flex items-center justify-between">
              <span>匹配到 {filteredApplications.length} 条相关投递记录</span>
              <button
                onClick={() => setSearchQuery('')}
                className="underline hover:text-white"
              >
                清除过滤
              </button>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* 模块三：底部「状态流转看板 / 列表」 */}
        {/* ============================================================== */}
        <section className="space-y-4">
          {/* 状态流转 Tab 切换 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                'ALL',
                'APPLIED',
                'HR_CALL',
                'TECH_INTERVIEW',
                'OFFER',
                'REJECTED',
              ] as TabStatus[]
            ).map((tab) => {
              const meta = STATUS_LABELS[tab];
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
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    active
                      ? `${meta.badge} text-white shadow-lg`
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
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

          {/* 列表渲染 */}
          {loadingList ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs">正在加载投递库...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2 rounded-2xl bg-slate-900/40 border border-slate-800">
              <Building2 className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">暂无匹配的职位投递记录</p>
              <p className="text-xs text-slate-600">
                可使用上方录入栏或从招聘 App 分享直接添加
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => {
                const isExpanded = expandedJdIds.has(app.id);
                const currentStatus = (app.status || 'APPLIED') as TabStatus;
                const statusMeta =
                  STATUS_LABELS[currentStatus] || STATUS_LABELS.APPLIED;

                // HR 联系方式解析
                let hrText = '';
                if (app.hr_contact) {
                  if (typeof app.hr_contact === 'string') hrText = app.hr_contact;
                  else if (typeof app.hr_contact === 'object') {
                    const c: any = app.hr_contact;
                    hrText = [c.name, c.phone, c.email].filter(Boolean).join(' · ');
                  }
                }

                return (
                  <div
                    key={app.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3.5 shadow-lg"
                  >
                    {/* 卡片头部：公司、合同、语言、距今天数 */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-slate-100">
                            {app.company_raw}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {app.contract_type || 'CDI'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            {app.language === 'FR' ? '🇫🇷 FR' : '🇬🇧 EN'}
                          </span>
                          {app.platform && app.platform !== 'OTHER' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {app.platform}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-300">
                          {app.title_raw}
                        </h3>
                      </div>

                      {/* 投递时间与状态标识 */}
                      <div className="text-right shrink-0 space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-end">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatDaysAgo(app.applied_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 地点、薪资与 HR 联系人高亮反查信息 */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      {app.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
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
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            发布于 {app.posted_at || app.postedAt} (
                            {formatDaysAgo(app.posted_at || app.postedAt || '')})
                          </span>
                        </div>
                      )}
                      {hrText && (
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/20">
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
                          原始职位链接 <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* 备注笔记 */}
                    {app.notes && (
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                        <strong className="text-slate-400 font-medium">笔记: </strong>
                        {app.notes}
                      </div>
                    )}

                    {/* 可折叠展开的原始 JD 摘要 */}
                    {app.jd_content && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleExpandJd(app.id)}
                          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition"
                        >
                          {isExpanded ? (
                            <>
                              <span>收起岗位 JD 正文</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>展开完整 JD 正文与要求</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-line max-h-64 overflow-y-auto font-mono leading-relaxed">
                            {app.jd_content}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 底部快捷状态流转按钮群 */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-500">
                        流转状态:
                      </span>
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {(
                          [
                            'APPLIED',
                            'HR_CALL',
                            'TECH_INTERVIEW',
                            'OFFER',
                            'REJECTED',
                          ] as const
                        ).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateStatus(app.id, st)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition active:scale-95 ${
                              app.status === st
                                ? 'bg-slate-700 text-white shadow'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            {STATUS_LABELS[st].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
