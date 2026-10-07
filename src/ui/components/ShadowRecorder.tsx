import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../state/AppState.tsx';

/** A short, local recording. Microphone access starts only on an explicit tap. */
export function ShadowRecorder() {
  const { t, tts, recogniser } = useApp();
  const [phase, setPhase] = useState<'idle' | 'asking' | 'recording'>('idle');
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recordingUrl = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const alive = useRef(true);
  const starting = useRef(false);

  function release() {
    clearTimeout(timer.current);
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
  }
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      release();
      if (recordingUrl.current) URL.revokeObjectURL(recordingUrl.current);
    };
  }, []);

  if (!globalThis.navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return null;

  async function start() {
    if (starting.current || recorder.current?.state === 'recording') return;
    starting.current = true;
    setFailed(false);
    setPhase('asking');
    tts.cancel();
    recogniser.stop();
    try {
      const captured = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) { captured.getTracks().forEach(track => track.stop()); return; }
      stream.current = captured;
      const current = new MediaRecorder(captured);
      recorder.current = current;
      const chunks: Blob[] = [];
      current.ondataavailable = event => { if (event.data.size > 0) chunks.push(event.data); };
      current.onstop = () => {
        release();
        if (!alive.current) return;
        if (recordingUrl.current) URL.revokeObjectURL(recordingUrl.current);
        const blob = new Blob(chunks, { type: current.mimeType || 'audio/webm' });
        if (blob.size > 0) {
          recordingUrl.current = URL.createObjectURL(blob);
          setUrl(recordingUrl.current);
        } else setFailed(true);
        setPhase('idle');
      };
      current.onerror = () => { release(); if (alive.current) { setFailed(true); setPhase('idle'); } };
      current.start();
      setPhase('recording');
      timer.current = setTimeout(() => { if (current.state === 'recording') current.stop(); }, 30_000);
    } catch {
      release();
      if (alive.current) { setFailed(true); setPhase('idle'); }
    } finally { starting.current = false; }
  }
  return <div className="shadow-recorder">
    {phase === 'recording' ? <button type="button" className="btn btn--ghost" onClick={() => recorder.current?.stop()}>{t('recorderStop')}</button>
      : <button type="button" className="btn btn--ghost" disabled={phase === 'asking'} onClick={() => void start()}>{t(phase === 'asking' ? 'recorderAsking' : url ? 'recorderAgain' : 'recorderStart')}</button>}
    <p role="status">{phase === 'recording' ? t('recorderRecording') : failed ? t('recorderFailed') : ''}</p>
    {url && phase === 'idle' ? <div><p>{t('recorderPlayback')}</p><audio controls src={url} aria-label={t('recorderPlayback')} /></div> : null}
    <p className="muted">{t('recorderPrivate')}</p>
  </div>;
}
