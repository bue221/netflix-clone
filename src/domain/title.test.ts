import { parseRoute } from '../routing/routes';
import { computePlacement } from '../components/TitleCard/HoverPreview';
import { formatRuntime, formatSeasons, matchPercentage } from './title';

describe('title formatting', () => {
  it('derives a match percentage from the score', () => {
    expect(matchPercentage(8.34)).toBe(83);
    expect(matchPercentage(10)).toBe(99);
    expect(matchPercentage(0)).toBeNull();
  });

  it('formats runtimes and seasons in Spanish', () => {
    expect(formatRuntime(45)).toBe('45 min');
    expect(formatRuntime(120)).toBe('2 h');
    expect(formatRuntime(93)).toBe('1 h 33 min');
    expect(formatRuntime(null)).toBeNull();
    expect(formatSeasons(1)).toBe('1 temporada');
    expect(formatSeasons(5)).toBe('5 temporadas');
  });
});

describe('parseRoute', () => {
  it('maps hashes to views and defaults to home', () => {
    expect(parseRoute('')).toBe('home');
    expect(parseRoute('#/series')).toBe('tv');
    expect(parseRoute('#/mi-lista')).toBe('my-list');
    expect(parseRoute('#/unknown')).toBe('home');
  });
});

describe('computePlacement', () => {
  const rect = (left: number, width: number) => new DOMRect(left, 100, width, (width * 9) / 16);

  it('grows centered on the card', () => {
    const placement = computePlacement(rect(500, 200), 1400, 0);
    expect(placement.origin).toBe('center');
    expect(placement.width).toBe(300);
    expect(placement.left).toBe(450);
  });

  it('stays inside the viewport at the edges', () => {
    expect(computePlacement(rect(56, 200), 1400, 0).origin).toBe('left');
    const right = computePlacement(rect(1144, 200), 1400, 0);
    expect(right.origin).toBe('right');
    expect(right.left + right.width).toBeLessThanOrEqual(1400 - 56);
  });
});
