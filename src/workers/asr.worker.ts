/// <reference lib="webworker" />
import { pipeline } from '@huggingface/transformers';
import type { AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

type ModelId = 'Xenova/whisper-tiny' | 'Xenova/whisper-base';
type WorkerRequest =
  | { type: 'load'; model: ModelId }
  | { type: 'transcribe'; id: number; sessionId: number; audio: Float32Array; language: 'fr' | 'en' | 'zh' };

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let loadedModel: ModelId | null = null;
let loading: Promise<void> | null = null;

const loadModel = async (model: ModelId) => {
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
        transcriber = await pipeline('automatic-speech-recognition', model, { device: 'webgpu', dtype: 'q8', progress_callback });
      } catch {
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
    void loadModel(message.model);
    return;
  }

  if (!transcriber) return;
  const language = { fr: 'french', en: 'english', zh: 'chinese' }[message.language];
  transcriber(message.audio, { language, task: 'transcribe', chunk_length_s: 1.5 })
    .then((result: string | { text: string }) => self.postMessage({
      type: 'transcript', id: message.id, sessionId: message.sessionId,
      text: typeof result === 'string' ? result : result.text,
    }))
    .catch((error: unknown) => self.postMessage({
      type: 'error', id: message.id, sessionId: message.sessionId,
      message: error instanceof Error ? error.message : 'Transcription failed',
    }));
};
