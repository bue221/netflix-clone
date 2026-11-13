import { useEffect, useState, type RefObject } from 'react';

interface NetworkInformation {
  saveData?: boolean;
}

/** Autoplaying video is skipped on small screens, reduced motion and data-saver connections. */
export function canAutoplayBackgroundVideo(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return (
    window.matchMedia('(min-width: 801px)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !connection?.saveData
  );
}

const ENGAGEMENT_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

/**
 * Becomes true after the first user interaction. Heavy third-party embeds (the YouTube
 * player is ~1 MB and sets cookies) wait for it so the initial load stays lean.
 */
export function useUserEngaged(): boolean {
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    if (engaged) return;
    const onEngage = () => setEngaged(true);
    ENGAGEMENT_EVENTS.forEach((type) => window.addEventListener(type, onEngage, { once: true, passive: true }));
    return () => ENGAGEMENT_EVENTS.forEach((type) => window.removeEventListener(type, onEngage));
  }, [engaged]);

  return engaged;
}

/** True while the element is mostly on screen and the tab is visible. */
export function useIsActivelyVisible(ref: RefObject<Element | null>, threshold = 0.4): boolean {
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true), { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  useEffect(() => {
    const onChange = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return inView && pageVisible;
}
