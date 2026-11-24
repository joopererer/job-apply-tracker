'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Sparkles,
  Star,
  X,
  XCircle,
} from 'lucide-react';
import { ScrapedJob, ContractType, WorkMode } from '@/lib/scraper';
import { DuplicateCheckResult } from '@/lib/supabase';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

export default function QuickAddModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickAddModalProps) {
  const [inputContent, setInputContent] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedJob, setParsedJob] = useState<ScrapedJob | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateCheckResult[]>([]);
  const [forceRecordAllowed, setForceRecordAllowed] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  // 表单字段
  const [editCompany, setEditCompany] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContract, setEditContract] = useState<ContractType>('CDI');
  const [editWorkMode, setEditWorkMode] = useState<WorkMode | ''>('');
  const [editLang, setEditLang] = useState<'FR' | 'EN'>('FR');
  const [editRating, setEditRating] = useState<string>('B');
  const [editStatus, setEditStatus] = useState<string>('APPLIED');
  const [editStarred, setEditStarred] = useState<boolean>(false);
  const [editLocation, setEditLocation] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editPostedAt, setEditPostedAt] = useState('');
  const [editHr, setEditHr] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // 监听 Esc 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 重置表单
  const resetForm = () => {
    setInputContent('');
    setParsing(false);
    setParseError(null);
    setParsedJob(null);
    setDuplicates([]);
    setForceRecordAllowed(false);
    setSavingRecord(false);
    setEditCompany('');
    setEditTitle('');
    setEditContract('CDI');
    setEditWorkMode('');
    setEditLang('FR');
    setEditRating('B');
    setEditStatus('APPLIED');
    setEditStarred(false);
    setEditLocation('');
    setEditSalary('');
    setEditPostedAt('');
    setEditHr('');
    setEditNotes('');
  };

  // 读取剪贴板
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
    } catch {
      alert('无法访问剪贴板，请在输入框内手动粘贴。');
    }
  };

  // 触发解析与查重
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
      const rawText: string | undefined = trimmed;

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

      // 初始化表单字段
      setEditCompany(job.companyRaw || '');
      setEditTitle(job.titleRaw || '');
      setEditContract(job.contractType || 'CDI');
      setEditWorkMode(job.workMode || '');
      setEditLang(job.language || 'FR');
      setEditRating('B');
      setEditStatus('APPLIED');
      setEditStarred(false);
      setEditLocation(job.location || '');
      setEditSalary(job.salaryRange || '');
      setEditPostedAt(job.postedAt || '');
    } catch (err: any) {
      setParseError(err.message || '网络连接或解析异常');
    } finally {
      setParsing(false);
    }
  };

  // 保存新投递记录
  const handleSave = async () => {
    if (!parsedJob) return;
    setSavingRecord(true);
    try {
      const payload = {
        ...parsedJob,
        companyRaw: editCompany,
        titleRaw: editTitle,
        contractType: editContract,
        workMode: editWorkMode || null,
        language: editLang,
        rating: editRating,
        is_starred: editStarred,
        location: editLocation || null,
        salaryRange: editSalary || null,
        postedAt: editPostedAt || null,
        notes: editNotes || null,
        hrContact: editHr ? { phone: editHr, raw: editHr } : null,
        status: editStatus || 'APPLIED',
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '保存失败');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`保存失败: ${err.message}`);
    } finally {
      setSavingRecord(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                录入新岗位
                <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
                  (支持 Apec · Indeed · HelloWork · LinkedIn · WTTJ)
                </span>
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* 输入框与快捷按钮 */}
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

          {/* 解析查重结果及编辑表单 */}
          {parsedJob && (
            <div className="pt-3 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
              {/* 高危重复警报 */}
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
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      放弃重复投递 (清除)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForceRecordAllowed(true)}
                      className="py-2 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/50 text-xs font-bold transition"
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
                      公司名称 (Company) *
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
                      职位名称 (Title) *
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      合同类型
                    </label>
                    <select
                      value={editContract}
                      onChange={(e) => setEditContract(e.target.value as ContractType)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="FREELANCE">FREELANCE</option>
                      <option value="STAGE">STAGE</option>
                      <option value="ALTERNANCE">ALTERNANCE</option>
                      <option value="UNKNOWN">UNKNOWN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      办公方式
                    </label>
                    <select
                      value={editWorkMode}
                      onChange={(e) => setEditWorkMode(e.target.value as WorkMode | '')}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                    >
                      <option value="">未注明</option>
                      <option value="ONSITE">🏢 现场</option>
                      <option value="HYBRID">🔄 混合</option>
                      <option value="REMOTE">🏠 远程</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      语言
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['FR', 'EN'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setEditLang(l)}
                          className={`py-0.5 text-xs font-bold rounded transition ${
                            editLang === l
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

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
                      发布日期
                    </label>
                    <input
                      type="text"
                      value={editPostedAt}
                      placeholder="如: 2026-10-25"
                      onChange={(e) => setEditPostedAt(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      HR 联系方式
                    </label>
                    <input
                      type="text"
                      value={editHr}
                      placeholder="电话/姓名"
                      onChange={(e) => setEditHr(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      投递备注
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      placeholder="内推/投递渠道等"
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      岗位评级
                    </label>
                    <select
                      value={editRating}
                      onChange={(e) => setEditRating(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                    >
                      <option value="S+">🔥 S+ 顶尖向往</option>
                      <option value="S">💎 S 重点目标</option>
                      <option value="A+">🌟 A+ 优质机会</option>
                      <option value="A">✨ A 值得一试</option>
                      <option value="A-">👍 A- 基本契合</option>
                      <option value="B">🎯 B 普通日常 (默认)</option>
                      <option value="C">📦 C 保底兜底</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      初始状态
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                    >
                      <option value="APPLIED">🚀 已直接投递 (APPLIED)</option>
                      <option value="SAVED">📌 先保存/未投递 (SAVED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      特别关注
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditStarred((v) => !v)}
                      className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        editStarred
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm shadow-amber-500/30'
                          : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${editStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                      <span>{editStarred ? '⭐ 已设为特别关注' : '设为特别关注'}</span>
                    </button>
                  </div>
                </div>

                {/* 提交按钮 */}
                <button
                  type="button"
                  onClick={handleSave}
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
        </div>
      </div>
    </div>
  );
}

