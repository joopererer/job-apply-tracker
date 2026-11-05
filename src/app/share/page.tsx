'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { ScrapedJob, ContractType } from '@/lib/scraper';
import { DuplicateCheckResult } from '@/lib/supabase';

function ShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 解析与查重结果
  const [parsedJob, setParsedJob] = useState<ScrapedJob | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateCheckResult[]>([]);
  const [forceSaveAllowed, setForceSaveAllowed] = useState(false);

  // 表单微调状态
  const [companyRaw, setCompanyRaw] = useState('');
  const [titleRaw, setTitleRaw] = useState('');
  const [contractType, setContractType] = useState<ContractType>('CDI');
  const [language, setLanguage] = useState<'FR' | 'EN'>('FR');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [postedAt, setPostedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [hrContact, setHrContact] = useState('');

  // 1. 读取 searchParams 并自动发起解析与查重
  useEffect(() => {
    let rawUrl = searchParams.get('url')?.trim() || '';
    const rawText = searchParams.get('text')?.trim() || '';
    const rawTitle = searchParams.get('title')?.trim() || '';

    // 若 url 参数为空，尝试从分享文本中提取 http(s) 链接
    if (!rawUrl && rawText) {
      const urlMatch = rawText.match(/https?:\/\/[^\s]+/i);
      if (urlMatch) {
        rawUrl = urlMatch[0];
      }
    }

    const combinedText = [rawTitle, rawText].filter(Boolean).join('\n');

    if (!rawUrl && !combinedText) {
      setLoading(false);
      setError('未检测到分享的有效网址或文本内容。请从招聘 App 重新分享。');
      return;
    }

    async function parseAndCheck() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/parse-and-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: rawUrl || undefined,
            rawText: combinedText || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || '解析失败');
        }

        const job: ScrapedJob = data.parsedJob;
        setParsedJob(job);
        setDuplicates(data.duplicates || []);

        // 同步初始化表单字段
        setCompanyRaw(job.companyRaw || '');
        setTitleRaw(job.titleRaw || '');
        setContractType(job.contractType || 'CDI');
        setLanguage(job.language || 'FR');
        setLocation(job.location || '');
        setSalaryRange(job.salaryRange || '');
        setPostedAt(job.postedAt || '');
      } catch (err: any) {
        setError(err.message || '网络异常或解析出错');
      } finally {
        setLoading(false);
      }
    }

    parseAndCheck();
  }, [searchParams]);

  // 2. 保存至投递库
  const handleSave = async () => {
    if (!parsedJob) return;
    setSaving(true);
    try {
      const payload = {
        ...parsedJob,
        companyRaw,
        titleRaw,
        contractType,
        language,
        location: location || null,
        salaryRange: salaryRange || null,
        postedAt: postedAt || null,
        notes: notes || null,
        hrContact: hrContact ? { phone: hrContact, raw: hrContact } : null,
        status: 'APPLIED',
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '保存失败');
      }

      setSavedSuccess(true);
    } catch (err: any) {
      alert(`保存失败: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            PWA 闪电分享录入
          </span>
        </div>
      </header>

      {/* 主体交互区 */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {/* 加载中状态 */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                正在智能解析岗位并防重比对...
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                零 Token 规则引擎清洗 · 三级查重数据库核对
              </p>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-800 text-sm font-medium text-slate-200 hover:bg-slate-700"
              >
                返回主页手动粘贴
              </Link>
            </div>
          </div>
        )}

        {/* 保存成功状态 */}
        {savedSuccess && (
          <div className="py-16 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                已成功记录投递！
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {companyRaw} · {titleRaw}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 active:scale-98 transition-all"
              >
                查看投递看板与闪电反查
              </button>
            </div>
          </div>
        )}

        {/* 结果展示与微调表单 */}
        {parsedJob && !loading && !savedSuccess && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* ⚠️ 醒目防重警告 */}
            {duplicates.length > 0 && !forceSaveAllowed && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/70 to-red-950/60 border-2 border-amber-500/80 shadow-xl shadow-amber-950/40 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-amber-200">
                      ⚠️ 发现 {duplicates.length} 条高危重复投递记录！
                    </h3>
                    <p className="text-xs text-amber-300/80 mt-0.5">
                      您很可能已经在该岗位或同团队职位投递过，请仔细核对避免给 HR 造成困扰。
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {duplicates.map((dup, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/90 border border-amber-600/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          {dup.level} 命中
                        </span>
                        <span className="text-slate-400 font-medium">
                          上次投递: {dup.matchedApplication?.applied_at?.slice(0, 10)}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200 text-sm">
                        {dup.matchedApplication?.company_raw} - {dup.matchedApplication?.title_raw}
                      </p>
                      <p className="text-amber-200/90">{dup.reason}</p>
                      <div className="flex items-center justify-between text-slate-400 pt-0.5">
                        <span>当前状态: <strong className="text-slate-300">{dup.matchedApplication?.status}</strong></span>
                        {dup.matchedApplication?.clean_url && (
                          <a
                            href={dup.matchedApplication.clean_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                          >
                            查看当时链接 <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    放弃重复投递 (返回)
                  </button>
                  <button
                    onClick={() => setForceSaveAllowed(true)}
                    className="py-2.5 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/50 text-xs font-semibold transition"
                  >
                    确认不同，强制记录
                  </button>
                </div>
              </div>
            )}

            {/* 岗位微调卡片 */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {parsedJob.platform}
                  </span>
                  {parsedJob.externalJobId && (
                    <span className="text-xs text-slate-400">
                      ID: #{parsedJob.externalJobId}
                    </span>
                  )}
                </div>
                {parsedJob.cleanUrl && (
                  <a
                    href={parsedJob.cleanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    原始职位 <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* 公司与职位名称 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    公司名称 (Company)
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={companyRaw}
                      onChange={(e) => setCompanyRaw(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    职位名称 (Title)
                  </label>
                  <input
                    type="text"
                    value={titleRaw}
                    onChange={(e) => setTitleRaw(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 合同类型与语言标签切换 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    合同类型
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractType)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                  >
                    <option value="CDI">CDI (长期合同)</option>
                    <option value="CDD">CDD (定期合同)</option>
                    <option value="FREELANCE">FREELANCE (自由职业)</option>
                    <option value="STAGE">STAGE (实习)</option>
                    <option value="ALTERNANCE">ALTERNANCE (学徒/半工半读)</option>
                    <option value="UNKNOWN">UNKNOWN (待定/未知)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    JD 语言
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                    {(['FR', 'EN'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`py-1 text-xs font-bold rounded-lg transition ${
                          language === lang
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lang === 'FR' ? '🇫🇷 法语' : '🇬🇧 英语'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 地点与薪资与发布日期 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    工作地点
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={location}
                      placeholder="如: Paris, Remote"
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    薪资范围
                  </label>
                  <input
                    type="text"
                    value={salaryRange}
                    placeholder="如: 45k - 55k €"
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  职位发布日期 (Posted Date)
                </label>
                <input
                  type="text"
                  value={postedAt}
                  placeholder="如: 2026-10-25 或 1 周前"
                  onChange={(e) => setPostedAt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* HR 联系信息与备注 */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    HR 联系方式 (用于来电反查)
                  </label>
                  <input
                    type="text"
                    value={hrContact}
                    placeholder="如: 06 12 34 56 78 或 Marie Dupont"
                    onChange={(e) => setHrContact(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    投递备注笔记
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    placeholder="如: 内部内推码、已定制 CV 版本号等..."
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* 保存按钮 */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || (duplicates.length > 0 && !forceSaveAllowed)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
                  duplicates.length > 0 && !forceSaveAllowed
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在保存投递记录...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    一键确认记录投递
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
