'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Phone,
  Save,
  Tag,
  X,
} from 'lucide-react';
import { ApplicationRecord, supabase } from '@/lib/supabase';
import { ContractType, JobLanguage, JobPlatform, WorkMode } from '@/lib/scraper';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface ApplicationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ApplicationRecord | null;
  onSaved: (updatedJob: ApplicationRecord) => void;
}

const PLATFORMS: JobPlatform[] = [
  'LINKEDIN',
  'INDEED',
  'HELLOWORK',
  'APEC',
  'JOBTEASER',
  'WTTJ',
  'OTHER',
];

const STATUS_KEYS = [
  'SAVED',
  'APPLIED',
  'HR_CALL',
  'TECH_INTERVIEW',
  'OFFER',
  'REJECTED',
] as const;

const RATING_KEYS = [
  { value: 'S+', key: 'rating.SPlus' },
  { value: 'S', key: 'rating.S' },
  { value: 'A+', key: 'rating.APlus' },
  { value: 'A', key: 'rating.A' },
  { value: 'A-', key: 'rating.AMinus' },
  { value: 'B', key: 'rating.B' },
  { value: 'C', key: 'rating.C' },
] as const;

export default function ApplicationEditModal({
  isOpen,
  onClose,
  job,
  onSaved,
}: ApplicationEditModalProps) {
  const { t } = useI18n();
  const [companyRaw, setCompanyRaw] = useState('');
  const [titleRaw, setTitleRaw] = useState('');
  const [contractType, setContractType] = useState<ContractType>('CDI');
  const [workMode, setWorkMode] = useState<WorkMode | ''>('');
  const [platform, setPlatform] = useState<JobPlatform>('OTHER');
  const [language, setLanguage] = useState<JobLanguage>('FR');
  const [status, setStatus] = useState('APPLIED');
  const [rating, setRating] = useState('B');
  const [isStarred, setIsStarred] = useState(false);
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [postedAt, setPostedAt] = useState('');
  const [appliedAt, setAppliedAt] = useState('');
  const [cleanUrl, setCleanUrl] = useState('');
  const [hrContact, setHrContact] = useState('');
  const [notes, setNotes] = useState('');
  const [jdContent, setJdContent] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化填充表单字段
  useEffect(() => {
    if (job && isOpen) {
      setCompanyRaw(job.company_raw || '');
      setTitleRaw(job.title_raw || '');
      setContractType((job.contract_type as ContractType) || 'CDI');
      setWorkMode((job.work_mode as WorkMode) || '');
      setPlatform((job.platform as JobPlatform) || 'OTHER');
      setLanguage((job.language as JobLanguage) || 'FR');
      setStatus(job.status || 'APPLIED');
      setRating((job.rating as string) || 'B');
      setIsStarred(Boolean(job.is_starred ?? job.isStarred));
      setLocation(job.location || '');
      setSalaryRange(job.salary_range || '');
      setPostedAt(job.posted_at ? job.posted_at.split('T')[0] : '');
      setAppliedAt(job.applied_at ? job.applied_at.slice(0, 10) : '');
      setCleanUrl(job.clean_url || '');

      let hrStr = '';
      if (job.hr_contact) {
        if (typeof job.hr_contact === 'string') hrStr = job.hr_contact;
        else if (typeof job.hr_contact === 'object') {
          const c: any = job.hr_contact;
          hrStr = [c.name, c.phone, c.email].filter(Boolean).join(' · ') || c.raw || '';
        }
      }
      setHrContact(hrStr);
      setNotes(job.notes || '');
      setJdContent(job.jd_content || '');
      setError(null);
    }
  }, [job, isOpen]);

  // 按 Esc 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job?.id) return;

    if (!companyRaw.trim() || !titleRaw.trim()) {
      setError(t('editModal.requiredAlert'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        id: job.id,
        company_raw: companyRaw.trim(),
        title_raw: titleRaw.trim(),
        contract_type: contractType,
        work_mode: workMode || null,
        platform: platform,
        language: language,
        status: status,
        rating: rating,
        is_starred: isStarred,
        location: location.trim() || null,
        salary_range: salaryRange.trim() || null,
        posted_at: postedAt.trim() || null,
        applied_at: appliedAt ? new Date(appliedAt).toISOString() : job.applied_at,
        clean_url: cleanUrl.trim() || null,
        hr_contact: hrContact.trim() || null,
        notes: notes.trim() || null,
        jd_content: jdContent,
      };

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '保存职位修改失败');
      }

      onSaved(data.application);
      onClose();
    } catch (err: any) {
      setError(err?.message || '保存修改失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {t('editModal.title')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('editModal.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* 表单主体 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 公司与职位 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.company')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={companyRaw}
                onChange={(e) => setCompanyRaw(e.target.value)}
                placeholder="Doctolib, VISIAN"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.titleField')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={titleRaw}
                onChange={(e) => setTitleRaw(e.target.value)}
                placeholder="Développeur Fullstack (H/F)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* 状态、评级、特别关注与平台 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.status')}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
              >
                {STATUS_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t(`status.${key}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.rating')}
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {RATING_KEYS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t(r.key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.starred')}
              </label>
              <button
                type="button"
                onClick={() => setIsStarred(!isStarred)}
                className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border ${
                  isStarred
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>⭐</span>
                <span>{isStarred ? t('editModal.starredYes') : t('editModal.starredNo')}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.platform')}
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as JobPlatform)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 合同、办公方式、语言 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.contractType')}
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.workMode')}
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode | '')}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">{t('editModal.workModeNotSpecified')}</option>
                <option value="ONSITE">🏢 {t('workMode.ONSITE')}</option>
                <option value="HYBRID">🔄 {t('workMode.HYBRID')}</option>
                <option value="REMOTE">🏠 {t('workMode.REMOTE')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as JobLanguage)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="FR">🇫🇷 FR</option>
                <option value="EN">🇬🇧 EN</option>
              </select>
            </div>
          </div>

          {/* 地点、薪资、发布时间、投递时间 */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.location')}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Paris (75)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.salary')}
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="45k - 55k €"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.postedDate')}
              </label>
              <input
                type="text"
                value={postedAt}
                onChange={(e) => setPostedAt(e.target.value)}
                placeholder="2026-10-25"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.appliedDate')}
              </label>
              <input
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 原链接与 HR 联系方式 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.cleanUrl')}
              </label>
              <input
                type="url"
                value={cleanUrl}
                onChange={(e) => setCleanUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('editModal.hrContact')}
              </label>
              <input
                type="text"
                value={hrContact}
                onChange={(e) => setHrContact(e.target.value)}
                placeholder="Marie · 06 12 34 56 78"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 备注笔记 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('editModal.notes')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('editModal.notesPlaceholder')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* JD 正文编辑 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>{t('editModal.jdContent')}</span>
              <span className="text-[11px] text-slate-500">
                {t('editModal.charCount', { count: jdContent.length })}
              </span>
            </label>
            <textarea
              rows={8}
              value={jdContent}
              onChange={(e) => setJdContent(e.target.value)}
              placeholder="Job description text..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Footer 动作条 */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {t('editModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('editModal.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('editModal.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

