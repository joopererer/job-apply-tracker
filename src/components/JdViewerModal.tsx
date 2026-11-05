'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  MapPin,
  Maximize2,
  Minimize2,
  Phone,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { ApplicationRecord } from '@/lib/supabase';

interface JdViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ApplicationRecord | null;
}

// 常见法语/英语招聘章节小标题正则
const SECTION_HEADING_REGEX =
  /^(descriptif du poste|le poste|vos missions|missions|profil recherch[eé]|votre profil|profil|comp[eé]tences|qualifications|avantages|processus|entreprise|[aà] propos|about the role|responsibilities|requirements|what you'll do|who you are|what we offer|benefits|key requirements|about us|notre offre)/i;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 实时关键词高亮渲染组件
 */
export function HighlightText({
  text,
  keyword,
}: {
  text: string;
  keyword: string;
}) {
  const trimmed = keyword.trim();
  if (!trimmed || !text) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${escapeRegex(trimmed)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-400 text-slate-950 font-bold px-1 py-0.5 rounded shadow-sm"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * 结构化 JD 渲染器：
 * - 智能识别小标题并渲染左侧竖条与高亮样式
 * - 智能识别列表项 (•, -, *, 1.) 并渲染优雅缩进与圆点
 * - 支持全量关键词高亮
 */
export function FormattedJdRenderer({
  content,
  searchKeyword = '',
}: {
  content: string;
  searchKeyword?: string;
}) {
  const blocks = useMemo(() => {
    if (!content) return [];
    const lines = content.split(/\r?\n/).map((l) => l.trim());
    return lines;
  }, [content]);

  if (!content) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        该职位尚未抓取或未录入 JD 正文内容
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm sm:text-base leading-relaxed text-slate-200">
      {blocks.map((line, idx) => {
        if (!line) {
          return <div key={idx} className="h-2" />;
        }

        // 1. 判断是否为章节小标题：较短(< 65 字符)且 (以冒号结尾 或 命中法英常见章节正则)
        const isHeader =
          line.length < 65 &&
          (line.endsWith(':') || SECTION_HEADING_REGEX.test(line));

        if (isHeader) {
          return (
            <div
              key={idx}
              className="mt-5 mb-2.5 pl-3.5 py-1 border-l-4 border-blue-500 bg-blue-500/10 rounded-r-xl"
            >
              <h4 className="text-sm sm:text-base font-extrabold text-blue-300 tracking-wide">
                <HighlightText text={line} keyword={searchKeyword} />
              </h4>
            </div>
          );
        }

        // 2. 判断是否为列表项：以 •, -, *, 或 "1." 开头
        const bulletMatch = line.match(/^([•\-\*]|\d+\.)\s+(.+)$/);
        if (bulletMatch) {
          const marker = bulletMatch[1];
          const textBody = bulletMatch[2];
          return (
            <div
              key={idx}
              className="flex items-start gap-2.5 pl-2 sm:pl-3 my-1 text-slate-300"
            >
              <span className="text-blue-400 font-bold shrink-0 select-none mt-0.5">
                {marker === '-' || marker === '*' ? '•' : marker}
              </span>
              <span className="flex-1">
                <HighlightText text={textBody} keyword={searchKeyword} />
              </span>
            </div>
          );
        }

        // 3. 常规自然段落
        return (
          <p key={idx} className="text-slate-300">
            <HighlightText text={line} keyword={searchKeyword} />
          </p>
        );
      })}
    </div>
  );
}

export default function JdViewerModal({
  isOpen,
  onClose,
  job,
}: JdViewerModalProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [keyword, setKeyword] = useState('');
  const [copied, setCopied] = useState(false);

  // 按 Esc 键快速关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setKeyword('');
      setCopied(false);
    }
  }, [isOpen]);

  // 计算关键词匹配总数
  const matchCount = useMemo(() => {
    const trimmed = keyword.trim();
    if (!trimmed || !job?.jd_content) return 0;
    try {
      const regex = new RegExp(escapeRegex(trimmed), 'gi');
      const matches = job.jd_content.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [keyword, job?.jd_content]);

  // 复制全文
  const handleCopy = async () => {
    if (!job?.jd_content) return;
    try {
      await navigator.clipboard.writeText(job.jd_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 容错
    }
  };

  if (!isOpen || !job) return null;

  // HR 联系方式解析
  let hrText = '';
  if (job.hr_contact) {
    if (typeof job.hr_contact === 'string') hrText = job.hr_contact;
    else if (typeof job.hr_contact === 'object') {
      const c: any = job.hr_contact;
      hrText = [c.name, c.phone, c.email].filter(Boolean).join(' · ');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* 遮罩点击关闭 */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl h-[92vh] max-h-[900px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10">
        {/* 顶部固定 Header */}
        <header className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur shrink-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-black text-slate-100 truncate">
                  {job.company_raw}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {job.contract_type || 'CDI'}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {job.language === 'FR' ? '🇫🇷 法语' : '🇬🇧 英语'}
                </span>
                {job.platform && job.platform !== 'OTHER' && (
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {job.platform}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-300 truncate">
                {job.title_raw}
              </h3>
            </div>

            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              title="按 Esc 或点击关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 职位基础元信息 */}
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{job.location}</span>
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span>💰 {job.salary_range}</span>
              </div>
            )}
            {job.posted_at && (
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>发布于 {job.posted_at}</span>
              </div>
            )}
            {hrText && (
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <Phone className="w-3 h-3" />
                <span>HR: {hrText}</span>
              </div>
            )}
            {job.clean_url && (
              <a
                href={job.clean_url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-blue-400 hover:underline"
              >
                原招聘网页 <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* 工具栏：搜索关键词 + 视图切换 + 复制全文 */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800 flex-wrap">
            {/* 搜索关键词输入框 */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="🔍 搜索 JD 关键词 (如: Flutter, CDI, Télétravail)..."
                className="w-full pl-9 pr-20 py-1.5 bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none transition"
              />
              {keyword && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      matchCount > 0
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {matchCount} 处匹配
                  </span>
                  <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="p-0.5 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* 视图切换与复制 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('formatted')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === 'formatted'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  智能排版
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === 'raw'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  原始纯文本
                </button>
              </div>

              {/* 复制全文 */}
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">已复制!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>复制全文</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 中部可滚动阅读区域 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-900/60 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {viewMode === 'formatted' ? (
            <FormattedJdRenderer
              content={job.jd_content || ''}
              searchKeyword={keyword}
            />
          ) : (
            <pre className="font-mono text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed select-text bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <HighlightText
                text={job.jd_content || ''}
                keyword={keyword}
              />
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
