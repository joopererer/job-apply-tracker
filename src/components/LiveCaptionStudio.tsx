'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, Mic, MicOff, Trash2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { ApplicationRecord } from '@/lib/supabase';

type Caption = { id: number; time: string; text: string };
type ModelId = 'Xenova/whisper-tiny' | 'Xenova/whisper-base';
type WorkerMessage = { type: 'ready' | 'progress' | 'error' | 'transcript' | 'INFER_END'; progress?: number; status?: string; message?: string; id?: number; sessionId?: number; text?: string; model?: ModelId };
const hallucinations = ['字幕製作人', '字幕制作人', 'Sous-titres réalisés', 'Thank you for watching', 'Thanks for watching', '请订阅', '訂閱'];
const debug = (message: string, data: Record<string, unknown> = {}) => console.debug(`[ASR ${new Date().toISOString()}] ${message}`, data);

export default function LiveCaptionStudio() {
  const { t } = useI18n();
  const [language, setLanguage] = useState<'fr' | 'en' | 'zh'>('fr');
  const [model, setModel] = useState<ModelId>('Xenova/whisper-tiny');
  const [loadedModel, setLoadedModel] = useState<ModelId | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'listening' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedApplication, setSelectedApplication] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const samplesRef = useRef<number[]>([]);
  const voicedRef = useRef(false);
  const requestIdRef = useRef(0);
  const lastSentRef = useRef(0);
  const sessionIdRef = useRef(0);
  const isListeningRef = useRef(false);
  const isInferringRef = useRef(false);
  const inferTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const latestText = captions.map((caption) => caption.text).join(' ');

  const releaseInferenceLock = useCallback((reason: string, sessionId?: number) => {
    if (inferTimeoutRef.current !== null) { clearTimeout(inferTimeoutRef.current); inferTimeoutRef.current = null; }
    isInferringRef.current = false;
    debug('inference lock released', { reason, sessionId });
  }, []);

  const armInferenceTimeout = useCallback((sessionId: number, id: number) => {
    if (inferTimeoutRef.current !== null) clearTimeout(inferTimeoutRef.current);
    inferTimeoutRef.current = setTimeout(() => releaseInferenceLock('10s timeout', sessionId), 10000);
    debug('inference dispatched', { sessionId, id });
  }, [releaseInferenceLock]);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/asr.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === 'progress' && typeof message.progress === 'number') setProgress(Math.round(message.progress));
      if (message.type === 'ready' && message.model) { setLoadedModel(message.model); setState((current) => current === 'loading' ? 'ready' : current); }
      if (message.type === 'INFER_END') {
        releaseInferenceLock('worker INFER_END', message.sessionId);
        debug('inference ended', { id: message.id, sessionId: message.sessionId });
        return;
      }
      if (message.type === 'error') {
        if (message.sessionId !== undefined && (message.sessionId !== sessionIdRef.current || !isListeningRef.current)) { debug('discarded stale error', { sessionId: message.sessionId }); return; }
        setError(message.message ?? ''); setState('error');
      }
      if (message.type === 'transcript' && message.text?.trim()) {
        if (message.sessionId !== sessionIdRef.current || !isListeningRef.current) { debug('discarded stale transcript', { sessionId: message.sessionId }); return; }
        const text = message.text.trim();
        if (hallucinations.some((phrase) => text.toLocaleLowerCase().includes(phrase.toLocaleLowerCase()))) { debug('discarded hallucination', { sessionId: message.sessionId, text }); return; }
        debug('caption appended', { sessionId: message.sessionId, text });
        setCaptions((current) => [...current, { id: message.id ?? Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), text }]);
      }
    };
    worker.onerror = (event) => {
      releaseInferenceLock('worker error', sessionIdRef.current);
      debug('worker runtime error', { message: event.message });
      setError(t('caption.modelError')); setState('error');
    };
    return () => { clearTimeout(inferTimeoutRef.current ?? undefined); worker.terminate(); workerRef.current = null; };
  }, [releaseInferenceLock, t]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [captions]);

  useEffect(() => {
    fetch('/api/applications').then((response) => response.ok ? response.json() : null).then((body) => {
      const records = body?.applications ?? body?.data ?? [];
      if (Array.isArray(records)) setApplications(records);
    }).catch(() => {});
  }, []);

  const stopListening = useCallback(() => {
    sessionIdRef.current += 1;
    isListeningRef.current = false;
    releaseInferenceLock('stop', sessionIdRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (processorRef.current) { processorRef.current.onaudioprocess = null; processorRef.current.disconnect(); }
    sourceRef.current?.disconnect();
    const context = contextRef.current;
    processorRef.current = null; sourceRef.current = null; streamRef.current = null; contextRef.current = null;
    if (context && context.state !== 'closed') void context.close();
    if (wakeLockRef.current) void wakeLockRef.current.release();
    wakeLockRef.current = null; samplesRef.current = []; voicedRef.current = false;
    setVolume(0);
    setState((current) => current === 'error' ? current : 'ready');
  }, [releaseInferenceLock]);

  useEffect(() => () => {
    isListeningRef.current = false;
    sessionIdRef.current += 1;
    processorRef.current?.disconnect(); sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void contextRef.current?.close(); void wakeLockRef.current?.release();
  }, []);

  const startListening = async () => {
    setError('');
    releaseInferenceLock('start', sessionIdRef.current);
    const worker = workerRef.current;
    if (!worker) return;
    if (loadedModel !== model || state === 'error') {
      setState('loading'); setProgress(0); worker.postMessage({ type: 'load', model, device: 'wasm' }); return;
    }
    if (state === 'loading') return;
    const sessionId = ++sessionIdRef.current;
    isListeningRef.current = true;
    isInferringRef.current = false;
    setState('listening');
    debug('capture starting', { sessionId, language });
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
      if (sessionId !== sessionIdRef.current || !isListeningRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;
      const context = new AudioContext({ sampleRate: 16000 });
      contextRef.current = context;
      await context.resume();
      if (sessionId !== sessionIdRef.current || !isListeningRef.current) return;
      const source = context.createMediaStreamSource(stream); sourceRef.current = source;
      const processor = context.createScriptProcessor(4096, 1, 1); processorRef.current = processor;
      samplesRef.current = []; voicedRef.current = false; lastSentRef.current = performance.now();
      processor.onaudioprocess = (event) => {
        if (sessionId !== sessionIdRef.current || !isListeningRef.current) return;
        const input = event.inputBuffer.getChannelData(0);
        let sum = 0; for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
        const rms = Math.sqrt(sum / input.length);
        setVolume(Math.min(100, Math.round(rms * 700)));
        if (rms > 0.009) voicedRef.current = true;
        if (isInferringRef.current) { samplesRef.current = []; voicedRef.current = false; lastSentRef.current = performance.now(); return; }
        samplesRef.current.push(...input);
        if (performance.now() - lastSentRef.current >= 2200) {
          const samples = samplesRef.current; samplesRef.current = []; lastSentRef.current = performance.now();
          if (voicedRef.current && samples.length) {
            const audio = new Float32Array(samples);
            isInferringRef.current = true;
            const id = ++requestIdRef.current;
            armInferenceTimeout(sessionId, id);
            worker.postMessage({ type: 'transcribe', id, sessionId, audio, language }, [audio.buffer]);
          }
          voicedRef.current = false;
        }
      };
      source.connect(processor); processor.connect(context.destination);
      try { wakeLockRef.current = await navigator.wakeLock?.request('screen') ?? null; } catch { wakeLockRef.current = null; }
    } catch {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (sessionId === sessionIdRef.current) { stopListening(); setError(t('caption.microphoneError')); setState('error'); }
    }
  };

  const saveNotes = async () => {
    const application = applications.find((item) => item.id === selectedApplication);
    if (!application || !latestText) return;
    setSaving(true); setSaved(false);
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: [application.notes, latestText].filter(Boolean).join('\n\n') }),
      });
      if (!response.ok) throw new Error('Save failed');
      setSaved(true);
    } catch { setError(t('caption.modelError')); }
    finally { setSaving(false); }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(latestText); setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0d111b]/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={18} />{t('caption.back')}</Link>
          <div className="flex items-center gap-3">
            <select aria-label="ASR model" value={model} onChange={(event) => setModel(event.target.value as ModelId)} disabled={state === 'listening' || state === 'loading'} className="rounded-lg border border-white/10 bg-slate-800 px-2 py-2 text-xs text-white">
              <option value="Xenova/whisper-tiny">Whisper Tiny · Fast</option><option value="Xenova/whisper-base">Whisper Base · Accurate</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-400">{t('caption.language')}
              <select value={language} onChange={(event) => setLanguage(event.target.value as 'fr' | 'en' | 'zh')} disabled={state === 'listening'} className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white">
                <option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 English</option><option value="zh">🇨🇳 中文</option>
              </select>
            </label>
          </div>
        </div>
      </header>
      <section className="mx-auto flex min-h-[calc(100dvh-61px)] max-w-5xl flex-col px-4 py-6 sm:px-8">
        <div className="mb-6"><p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">FR JOB TRACKER · OFFLINE ASR</p><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('caption.title')}</h1><p className="mt-2 text-sm text-slate-400">{t('caption.subtitle')}</p></div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button onClick={state === 'listening' ? stopListening : startListening} disabled={state === 'loading'} className={`flex min-h-12 items-center gap-2 rounded-xl px-5 font-bold transition ${state === 'listening' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-300'} disabled:cursor-wait disabled:opacity-70`}>
            {state === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}{state === 'listening' ? t('caption.stop') : state === 'loading' ? t('caption.loadingModel') : t('caption.start')}
          </button>
          <button onClick={() => setCaptions([])} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-slate-300 hover:bg-white/5"><Trash2 size={16} />{t('caption.clear')}</button>
          <button onClick={copyAll} disabled={!latestText} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? t('caption.copied') : t('caption.copyAll')}</button>
          <div className="flex items-center gap-2" aria-label="Microphone volume"><Mic size={14} className="text-slate-500" /><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400 transition-[width] duration-75" style={{ width: `${volume}%` }} /></div></div>
          <span className={`ml-auto flex items-center gap-2 text-xs ${state === 'listening' ? 'text-emerald-300' : 'text-slate-500'}`}><span className={`h-2 w-2 rounded-full ${state === 'listening' ? 'animate-pulse bg-emerald-400' : 'bg-slate-600'}`} />{state === 'listening' ? t('caption.listening') : t('caption.idle')}</span>
        </div>
        {state === 'loading' && <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4"><div className="mb-2 flex justify-between text-sm text-cyan-100"><span>{t('caption.loadingModel')}</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.max(4, progress)}%` }} /></div></div>}
        {(error || state === 'error') && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">{error || t('caption.modelError')}</p>}
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-[#101520] p-4 sm:p-6" aria-live="polite">
          {captions.length === 0 ? <div className="flex min-h-48 items-center justify-center text-center text-slate-600">{t('caption.noCaptions')}</div> : captions.map((caption, index) => <article key={caption.id} className={`flex gap-4 rounded-xl p-3 ${index === captions.length - 1 ? 'bg-cyan-400/10 text-xl font-semibold leading-relaxed text-white sm:text-2xl' : 'text-base leading-relaxed text-slate-400'}`}><time className="shrink-0 pt-1 font-mono text-xs text-cyan-500/80">{caption.time}</time><p>{caption.text}</p></article>)}
          <div ref={bottomRef} />
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101520] p-4 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-3 text-sm text-slate-400"><span className="shrink-0">{t('caption.saveToNotes')}</span><select value={selectedApplication} onChange={(event) => { setSelectedApplication(event.target.value); setSaved(false); }} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"><option value="">{t('caption.chooseApplication')}</option>{applications.map((application) => <option key={application.id} value={application.id}>{application.company_raw} · {application.title_raw}</option>)}</select></label>
          <button onClick={saveNotes} disabled={!selectedApplication || !latestText || saving} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600 disabled:opacity-40">{saved ? t('caption.notesSaved') : saving ? t('common.saving') : t('caption.saveNotes')}</button>
        </div>
      </section>
    </main>
  );
}
