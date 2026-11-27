/// <reference lib="webworker" />
import { pipeline } from '@huggingface/transformers';
import type { AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

type ModelId = 'Xenova/whisper-tiny' | 'Xenova/whisper-base';
type WorkerRequest =
  | { type: 'load'; model: ModelId; device?: 'wasm' | 'webgpu' }
  | { type: 'transcribe'; id: number; sessionId: number; audio: Float32Array; language: 'fr' | 'en' | 'zh' };

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let loadedModel: ModelId | null = null;
let loading: Promise<void> | null = null;
const debug = (message: string, data: Record<string, unknown> = {}) => console.debug(`[ASR worker ${new Date().toISOString()}] ${message}`, data);

const loadModel = async (model: ModelId, device: 'wasm' | 'webgpu' = 'wasm') => {
  if (transcriber && loadedModel === model) {
    self.postMessage({ type: 'ready', model });
    return;
  }
  if (loading) return loading;

  loading = (async () => {
    const progress_callback = (progress: { status?: string; progress?: number; file?: string }) => {
      self.postMessage({ type: 'progress', status: progress.status, progress: progress.progress, file: progress.file });
    };
    try {
      try {
        debug('loading model', { model, device });
        transcriber = await pipeline('automatic-speech-recognition', model, { device, dtype: 'q8', progress_callback });
      } catch (error) {
        if (device === 'wasm') throw error;
        debug('WebGPU unavailable; falling back to WASM', { error });
        transcriber = await pipeline('automatic-speech-recognition', model, { device: 'wasm', dtype: 'q8', progress_callback });
      }
      loadedModel = model;
      self.postMessage({ type: 'ready', model });
    } catch (error) {
      transcriber = null;
      loadedModel = null;
      self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Model loading failed' });
    } finally {
      loading = null;
    }
  })();
  return loading;
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  if (message.type === 'load') {
    void loadModel(message.model, message.device);
    return;
  }

  void (async () => {
    try {
      debug('inference started', { id: message.id, sessionId: message.sessionId });
      if (!transcriber) throw new Error('ASR model is not ready');
      const language = { fr: 'french', en: 'english', zh: 'chinese' }[message.language];
      const result = await transcriber(message.audio, { language, task: 'transcribe', chunk_length_s: 2.2 });
      const text = typeof result === 'string' ? result : result.text;
      self.postMessage({ type: 'transcript', id: message.id, sessionId: message.sessionId, text });
      debug('inference completed', { id: message.id, sessionId: message.sessionId });
    } catch (error) {
      debug('inference failed', { id: message.id, sessionId: message.sessionId, error });
      self.postMessage({ type: 'error', id: message.id, sessionId: message.sessionId, message: error instanceof Error ? error.message : 'Transcription failed' });
    } finally {
      self.postMessage({ type: 'INFER_END', id: message.id, sessionId: message.sessionId });
    }
  })();
};
