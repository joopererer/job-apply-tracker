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
import { useI18n } from '@/lib/i18n/I18nProvider';

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

const STATUS_STYLES: Record<string, { color: string; badge: string; icon: string }> = {
  SAVED: { color: 'bg-slate-800 text-slate-300 border-slate-700', badge: 'bg-slate-700', icon: '📌' },
  APPLIED: { color: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/70', badge: 'bg-emerald-600', icon: '🚀' },
  HR_CALL: { color: 'bg-purple-950/90 text-purple-300 border-purple-700/70', badge: 'bg-purple-600', icon: '📞' },
  TECH_INTERVIEW: { color: 'bg-amber-950/90 text-amber-200 border-amber-600/70', badge: 'bg-amber-500', icon: '💻' },
  OFFER: { color: 'bg-emerald-700 text-emerald-100 border-emerald-400 font-extrabold shadow-sm', badge: 'bg-emerald-500', icon: '🎉' },
  REJECTED: { color: 'bg-zinc-800/90 text-zinc-400 border-zinc-700', badge: 'bg-zinc-700', icon: '❌' },
};

const ALL_STATUSES = ['SAVED', 'APPLIED', 'HR_CALL', 'TECH_INTERVIEW', 'OFFER', 'REJECTED'] as const;

function formatDaysAgo(isoDate?: string | null, t?: (k: string, p?: any) => string): string {
  if (!isoDate) return t ? t('card.recent') : '近期';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return t ? t('card.today') : '今天';
  if (diffDays === 1) return t ? t('card.yesterday') : '昨天';
  if (diffDays < 7) return t ? t('card.daysAgo', { n: diffDays }) : `${diffDays} 天前`;
  if (diffDays < 30) return t ? t('card.weeksAgo', { n: Math.floor(diffDays / 7) }) : `${Math.floor(diffDays / 7)} 周前`;
  return t ? t('card.monthsAgo', { n: Math.floor(diffDays / 30) }) : `${Math.floor(diffDays / 30)} 个月前`;
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
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    setConfirmDelete(false);
  }, [isOpen, job?.id]);

  if (!isOpen || !job) return null;

  const isStarred = Boolean(job.is_starred ?? job.isStarred);
  const statusStyle = STATUS_STYLES[job.status] || STATUS_STYLES.APPLIED;
  const statusLabel = t(`status.${job.status}`);

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
              title={isStarred ? t('card.unstar') : t('card.star')}
            >
              <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <div>
              <span className="text-xs text-slate-400 font-semibold">{t('jobDetail.title')}</span>
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
              title={t('card.edit')}
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
                <span>
                  {t('jobDetail.appliedOn', {
                    date: job.applied_at?.slice(0, 10),
                    daysAgo: formatDaysAgo(job.applied_at, t),
                  })}
                </span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.color}`}>
                {statusStyle.icon} {statusLabel}
              </span>
            </div>
          </div>

          {/* 快速修改状态 */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-slate-400">{t('jobDetail.switchStatus')}</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {ALL_STATUSES.map((st) => {
                const style = STATUS_STYLES[st];
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
                    <span>{style.icon}</span>
                    <span>{t(`status.${st}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 元信息标签 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">{t('jobDetail.contractType')}</span>
              <strong className="text-slate-200">{job.contract_type || 'UNKNOWN'}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">{t('jobDetail.workMode')}</span>
              <strong className="text-slate-200">
                {job.work_mode === 'ONSITE'
                  ? `🏢 ${t('workMode.ONSITE')}`
                  : job.work_mode === 'HYBRID'
                  ? `🔄 ${t('workMode.HYBRID')}`
                  : job.work_mode === 'REMOTE'
                  ? `🏠 ${t('workMode.REMOTE')}`
                  : t('jobDetail.notSpecified')}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">{t('jobDetail.location')}</span>
              <strong className="text-slate-200">{job.location || t('jobDetail.notSpecified')}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">{t('jobDetail.salary')}</span>
              <strong className="text-emerald-400">{job.salary_range || t('jobDetail.notSpecified')}</strong>
            </div>
          </div>

          {/* HR 联系人与外部链接 */}
          <div className="space-y-2">
            {hrText && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{t('jobDetail.hrContact')} <strong>{hrText}</strong></span>
              </div>
            )}

            {job.clean_url && (
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">{t('jobDetail.sourcePage')}</span>
                <a
                  href={job.clean_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  {t('jobDetail.openOriginal')} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* 笔记 */}
          {job.notes && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-bold block">{t('jobDetail.notes')}</span>
              <p className="text-slate-200 whitespace-pre-wrap">{job.notes}</p>
            </div>
          )}

          {/* JD 预览或查看 */}
          {job.jd_content && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  {t('jobDetail.jdDetail')}
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
                        <span className="text-emerald-400">{t('jobDetail.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>{t('jobDetail.copy')}</span>
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
                    <span>{t('jobDetail.fullscreenRead')}</span>
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
                <span className="text-rose-300 font-bold">{t('jobDetail.confirmDelete')}</span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(job.id);
                    onClose();
                  }}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition"
                >
                  {t('common.confirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition"
                >
                  {t('common.cancel')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('jobDetail.deleteRecord')}</span>
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
              <span>{t('jobDetail.editAll')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

