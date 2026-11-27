/// <reference lib="webworker" />
import { pipeline } from '@huggingface/transformers';
import type { AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

type WorkerRequest =
  | { type: 'load' }
  | { type: 'transcribe'; id: number; audio: Float32Array; language: 'fr' | 'en' | 'zh' };

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let loading: Promise<void> | null = null;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  if (message.type === 'load') {
    if (!loading) {
      loading = (async () => {
        try {
          transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
            dtype: 'q8',
            progress_callback: (progress: { status?: string; progress?: number; file?: string }) => {
              self.postMessage({ type: 'progress', status: progress.status, progress: progress.progress, file: progress.file });
            },
          });
          self.postMessage({ type: 'ready' });
        } catch (error) {
          loading = null;
          self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Model loading failed' });
        }
      })();
    }
    return;
  }

  if (message.type === 'transcribe' && transcriber) {
    const language = { fr: 'french', en: 'english', zh: 'chinese' }[message.language];
    transcriber(message.audio, { language, task: 'transcribe', chunk_length_s: 2.2 })
      .then((result: string | { text: string }) => self.postMessage({ type: 'transcript', id: message.id, text: typeof result === 'string' ? result : result.text }))
      .catch((error: unknown) => self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Transcription failed' }));
  }
};
