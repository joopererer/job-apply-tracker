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
import { ApplicationRecord } from '@/lib/supabase';
import { ContractType, JobLanguage, JobPlatform } from '@/lib/scraper';

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

const STATUSES: { value: string; label: string }[] = [
  { value: 'APPLIED', label: '已投递 (Applied)' },
  { value: 'HR_CALL', label: 'HR 沟通中 (HR Call)' },
  { value: 'TECH_INTERVIEW', label: '技术面试 (Tech Interview)' },
  { value: 'OFFER', label: '已获 Offer (Offer)' },
  { value: 'REJECTED', label: '未通过 (Rejected)' },
];

export default function ApplicationEditModal({
  isOpen,
  onClose,
  job,
  onSaved,
}: ApplicationEditModalProps) {
  const [companyRaw, setCompanyRaw] = useState('');
  const [titleRaw, setTitleRaw] = useState('');
  const [contractType, setContractType] = useState<ContractType>('CDI');
  const [platform, setPlatform] = useState<JobPlatform>('OTHER');
  const [language, setLanguage] = useState<JobLanguage>('FR');
  const [status, setStatus] = useState('APPLIED');
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
      setPlatform((job.platform as JobPlatform) || 'OTHER');
      setLanguage((job.language as JobLanguage) || 'FR');
      setStatus(job.status || 'APPLIED');
      setLocation(job.location || '');
      setSalaryRange(job.salary_range || '');
      setPostedAt(job.posted_at || '');
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
      setError('公司名称和职位名称不能为空！');
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
        platform: platform,
        language: language,
        status: status,
        location: location.trim() || null,
        salary_range: salaryRange.trim() || null,
        posted_at: postedAt.trim() || null,
        applied_at: appliedAt ? new Date(appliedAt).toISOString() : job.applied_at,
        clean_url: cleanUrl.trim() || null,
        hr_contact: hrContact.trim() || null,
        notes: notes.trim() || null,
        jd_content: jdContent,
      };

      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
                编辑投递记录
              </h3>
              <p className="text-xs text-slate-400">
                修改职位字段将自动同步更新标准化检索索引
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
                公司名称 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={companyRaw}
                onChange={(e) => setCompanyRaw(e.target.value)}
                placeholder="如: Doctolib, VISIAN"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                职位名称 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={titleRaw}
                onChange={(e) => setTitleRaw(e.target.value)}
                placeholder="如: Développeur Fullstack Flutter (H/F)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* 状态、平台、合同、语言 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                当前状态
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                来源平台
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                合同类型
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="CDI">CDI (长期合同)</option>
                <option value="CDD">CDD (定期合同)</option>
                <option value="OTHER">其他类型</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                语言
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as JobLanguage)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="FR">🇫🇷 法语 (FR)</option>
                <option value="EN">🇬🇧 英语 (EN)</option>
              </select>
            </div>
          </div>

          {/* 地点、薪资、发布时间、投递时间 */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                工作地点
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="如: Paris (75)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                薪资范围
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="如: 45k - 55k €"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                发布日期
              </label>
              <input
                type="text"
                value={postedAt}
                onChange={(e) => setPostedAt(e.target.value)}
                placeholder="如: 2026-10-25"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                投递日期
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
                原始职位链接 (Clean URL)
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
                HR 联系方式 (用于来电反查)
              </label>
              <input
                type="text"
                value={hrContact}
                onChange={(e) => setHrContact(e.target.value)}
                placeholder="如: Marie · 06 12 34 56 78"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 备注笔记 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              备注笔记
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="如: 内推员工、投递用简历版本、HR要求等..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* JD 正文编辑 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>岗位 JD 正文要求 (保存时将自动执行结构化清洗)</span>
              <span className="text-[11px] text-slate-500">
                {jdContent.length} 字符
              </span>
            </label>
            <textarea
              rows={8}
              value={jdContent}
              onChange={(e) => setJdContent(e.target.value)}
              placeholder="在此粘贴或修改职位正文内容..."
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
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存修改
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

