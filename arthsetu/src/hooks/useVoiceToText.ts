import { useCallback, useMemo, useRef, useState } from 'react';

type VoiceTextCallback = (text: string) => void;

interface UseVoiceToTextOptions {
  language?: string;
  onResult?: VoiceTextCallback;
}

interface UseVoiceToTextReturn {
  supported: boolean;
  listening: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  clearError: () => void;
}

type SpeechRecognitionConstructor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const globalWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition ?? null;
}

export function useVoiceToText(options: UseVoiceToTextOptions = {}): UseVoiceToTextReturn {
  const { language = 'en-US', onResult } = options;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionConstructor> | null>(null);

  const Recognition = useMemo(() => getRecognitionConstructor(), []);
  const supported = Recognition !== null;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setError(null);
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setError(event.error || 'Failed to capture voice input.');
      setListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      if (transcript && onResult) {
        onResult(transcript);
      }
    };

    recognition.start();
  }, [Recognition, language, onResult]);

  const clearError = useCallback(() => setError(null), []);

  return {
    supported,
    listening,
    error,
    start,
    stop,
    clearError,
  };
}
