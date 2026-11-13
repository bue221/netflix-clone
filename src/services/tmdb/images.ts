const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type PosterSize = 'w185' | 'w342' | 'w500' | 'w780';
export type LogoSize = 'w300' | 'w500';

export function imageUrl(path: string | null, size: BackdropSize | PosterSize | LogoSize): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/** Capped at w500: the billboard poster sits under a heavy gradient, so extra resolution is not visible. */
export function posterSrcSet(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${IMAGE_BASE}/w342${path} 342w, ${IMAGE_BASE}/w500${path} 500w`;
}

export function logoSrcSet(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${IMAGE_BASE}/w300${path} 300w, ${IMAGE_BASE}/w500${path} 500w`;
}

/** srcset for responsive backdrops so small cards never download 1280px images. */
export function backdropSrcSet(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${IMAGE_BASE}/w300${path} 300w, ${IMAGE_BASE}/w780${path} 780w, ${IMAGE_BASE}/w1280${path} 1280w`;
}
