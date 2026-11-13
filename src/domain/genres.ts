// TMDB genre ids are stable, so a static map avoids two extra requests on every page load.
const GENRE_NAMES: Record<number, string> = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  14: 'Fantasía',
  36: 'Historia',
  27: 'Terror',
  10402: 'Música',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia ficción',
  10770: 'Película de TV',
  53: 'Suspenso',
  10752: 'Bélica',
  37: 'Western',
  10759: 'Acción y aventura',
  10762: 'Infantil',
  10763: 'Noticias',
  10764: 'Reality',
  10765: 'Ciencia ficción y fantasía',
  10766: 'Telenovela',
  10767: 'Talk show',
  10768: 'Guerra y política',
};

export function genreNames(ids: readonly number[], limit = 3): string[] {
  return ids
    .map((id) => GENRE_NAMES[id])
    .filter((name): name is string => Boolean(name))
    .slice(0, limit);
}
