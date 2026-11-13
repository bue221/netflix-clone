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
