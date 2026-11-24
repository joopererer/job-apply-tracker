'use client';

import React from 'react';
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  MapPin,
  Maximize2,
  Pencil,
  Phone,
  Sparkles,
  Star,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { ApplicationRecord } from '@/lib/supabase';
import { FormattedJdRenderer } from '@/components/JdViewerModal';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ApplicationRecord | null;
  onEdit: (job: ApplicationRecord) => void;
  onViewJd: (job: ApplicationRecord) => void;
  onToggleStar: (job: ApplicationRecord, e: React.MouseEvent) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; badge: string; icon: string }> = {
  SAVED: { label: '未投递', color: 'bg-slate-800 text-slate-300 border-slate-700', badge: 'bg-slate-700', icon: '📌' },
  APPLIED: { label: '已投递', color: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/70', badge: 'bg-emerald-600', icon: '🚀' },
  HR_CALL: { label: 'HR 沟通', color: 'bg-purple-950/90 text-purple-300 border-purple-700/70', badge: 'bg-purple-600', icon: '📞' },
  TECH_INTERVIEW: { label: '技术面试', color: 'bg-amber-950/90 text-amber-200 border-amber-600/70', badge: 'bg-amber-500', icon: '💻' },
  OFFER: { label: '已获 Offer', color: 'bg-emerald-700 text-emerald-100 border-emerald-400 font-extrabold shadow-sm', badge: 'bg-emerald-500', icon: '🎉' },
  REJECTED: { label: '未通过', color: 'bg-zinc-800/90 text-zinc-400 border-zinc-700', badge: 'bg-zinc-700', icon: '❌' },
};

const ALL_STATUSES = ['SAVED', 'APPLIED', 'HR_CALL', 'TECH_INTERVIEW', 'OFFER', 'REJECTED'] as const;

function formatDaysAgo(isoDate?: string | null): string {
  if (!isoDate) return '近期';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  return `${Math.floor(diffDays / 30)} 个月前`;
}

export default function JobDetailModal({
  isOpen,
  onClose,
  job,
  onEdit,
  onViewJd,
  onToggleStar,
  onUpdateStatus,
  onDelete,
}: JobDetailModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    setConfirmDelete(false);
  }, [isOpen, job?.id]);

  if (!isOpen || !job) return null;

  const isStarred = Boolean(job.is_starred ?? job.isStarred);
  const statusMeta = STATUS_LABELS[job.status] || STATUS_LABELS.APPLIED;

  let hrText = '';
  if (job.hr_contact) {
    if (typeof job.hr_contact === 'string') hrText = job.hr_contact;
    else if (typeof job.hr_contact === 'object') {
      const c: any = job.hr_contact;
      hrText = [c.name, c.phone, c.email].filter(Boolean).join(' · ') || c.raw || '';
    }
  }

  const handleCopyJd = async () => {
    if (!job.jd_content) return;
    try {
      await navigator.clipboard.writeText(job.jd_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 容错
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => onToggleStar(job, e)}
              className={`p-1.5 rounded-xl transition ${
                isStarred
                  ? 'text-amber-400 bg-amber-500/15 hover:bg-amber-500/25'
                  : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
              }`}
              title={isStarred ? '取消特别关注' : '设为特别关注 ⭐'}
            >
              <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <div>
              <span className="text-xs text-slate-400 font-semibold">岗位详情速览</span>
              <h2 className="text-base sm:text-lg font-black text-slate-100 leading-tight">
                {job.company_raw}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(job);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
              title="编辑此职位"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 职位名称与状态 */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{job.title_raw}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>投递于 {job.applied_at?.slice(0, 10)} ({formatDaysAgo(job.applied_at)})</span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.color}`}>
                {statusMeta.icon} {statusMeta.label}
              </span>
            </div>
          </div>

          {/* 快速修改状态 */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-slate-400">切换当前流转状态:</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {ALL_STATUSES.map((st) => {
                const meta = STATUS_LABELS[st];
                const active = job.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(job.id, st)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                      active
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 元信息标签 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">合同类型</span>
              <strong className="text-slate-200">{job.contract_type || 'UNKNOWN'}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">办公模式</span>
              <strong className="text-slate-200">
                {job.work_mode === 'ONSITE' ? '🏢 现场办公' : job.work_mode === 'HYBRID' ? '🔄 混合办公' : job.work_mode === 'REMOTE' ? '🏠 远程' : '未注明'}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">地点</span>
              <strong className="text-slate-200">{job.location || '未注明'}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">薪资</span>
              <strong className="text-emerald-400">{job.salary_range || '未注明'}</strong>
            </div>
          </div>

          {/* HR 联系人与外部链接 */}
          <div className="space-y-2">
            {hrText && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-amber-400" />
                <span>HR 联系方式: <strong>{hrText}</strong></span>
              </div>
            )}

            {job.clean_url && (
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">招聘来源页面:</span>
                <a
                  href={job.clean_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  打开原始职位链接 <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* 笔记 */}
          {job.notes && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-bold block">投递备忘笔记:</span>
              <p className="text-slate-200 whitespace-pre-wrap">{job.notes}</p>
            </div>
          )}

          {/* JD 预览或查看 */}
          {job.jd_content && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  职位 JD 详情
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJd}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/60 flex items-center gap-1 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">已复制!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewJd(job);
                    }}
                    className="px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 flex items-center gap-1 transition"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>全屏阅读</span>
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto pr-1 text-xs text-slate-300">
                <FormattedJdRenderer content={job.jd_content} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            {confirmDelete ? (
              <div className="inline-flex items-center gap-1.5 bg-rose-950/80 border border-rose-800 px-2 py-1 rounded-xl text-xs">
                <span className="text-rose-300 font-bold">确定删除?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(job.id);
                    onClose();
                  }}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition"
                >
                  确认
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除记录</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(job);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>编辑全部字段</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

