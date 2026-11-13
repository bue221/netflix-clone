import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface CarouselState {
  page: number;
  pageCount: number;
  atStart: boolean;
  atEnd: boolean;
}

const INITIAL: CarouselState = { page: 0, pageCount: 1, atStart: true, atEnd: false };

/** One "page" is the visible width of the track, so arrows move a full set of cards like Netflix. */
function pageStep(track: HTMLElement): number {
  const style = getComputedStyle(track);
  const padding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
  const gap = Number.parseFloat(style.columnGap) || 0;
  return Math.max(1, track.clientWidth - padding + gap);
}

function measure(track: HTMLElement): CarouselState {
  const step = pageStep(track);
  const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
  const atStart = track.scrollLeft <= 1;
  const atEnd = maxScroll - track.scrollLeft <= 1;
  // Small tolerance so sub-pixel rounding does not create an extra empty page.
  const pageCount = maxScroll <= 1 ? 1 : Math.ceil(maxScroll / step - 0.02) + 1;
  const page = atEnd ? pageCount - 1 : Math.min(pageCount - 1, Math.round(track.scrollLeft / step));
  return { page, pageCount, atStart, atEnd };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function useCarousel(trackRef: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<CarouselState>(INITIAL);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(track);
        setState((previous) =>
          previous.page === next.page &&
          previous.pageCount === next.pageCount &&
          previous.atStart === next.atStart &&
          previous.atEnd === next.atEnd
            ? previous
            : next,
        );
      });
    };

    update();
    track.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [trackRef]);

  const scrollByPage = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
      const { atEnd } = measure(track);
      // Netflix wraps around to the first page after the last one.
      if (direction === 1 && atEnd) track.scrollTo({ left: 0, behavior });
      else track.scrollBy({ left: direction * pageStep(track), behavior });
    },
    [trackRef],
  );

  return { ...state, scrollByPage };
}
