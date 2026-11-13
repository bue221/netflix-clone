import { useEffect, useRef, useState } from 'react';
import styles from './Billboard.module.css';

const YOUTUBE_ORIGIN = 'https://www.youtube-nocookie.com';
/** YouTube shows its loading UI and start-of-playback controls for a few seconds; stay hidden until they fade. */
const REVEAL_DELAY_MS = 4000;

interface BillboardTrailerProps {
  videoKey: string;
  muted: boolean;
  paused: boolean;
}

function trailerUrl(videoKey: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: videoKey,
    rel: '0',
    playsinline: '1',
    disablekb: '1',
    iv_load_policy: '3',
    enablejsapi: '1',
    origin: window.location.origin,
  });
  return `${YOUTUBE_ORIGIN}/embed/${videoKey}?${params}`;
}

/** Background trailer controlled through the YouTube IFrame postMessage protocol, without loading the YT script. */
export function BillboardTrailer({ videoKey, muted, paused }: BillboardTrailerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const send = (func: string) =>
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), YOUTUBE_ORIGIN);
    send(muted ? 'mute' : 'unMute');
    send(paused ? 'pauseVideo' : 'playVideo');
  }, [loaded, muted, paused]);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <iframe
      ref={iframeRef}
      className={`${styles.trailer} ${revealed ? styles.trailerVisible : ''}`}
      src={trailerUrl(videoKey)}
      title="Avance del título destacado"
      allow="autoplay; encrypted-media"
      tabIndex={-1}
      aria-hidden="true"
      onLoad={() => setLoaded(true)}
    />
  );
}
