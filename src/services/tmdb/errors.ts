export type TmdbErrorKind = 'config' | 'network' | 'timeout' | 'http' | 'parse' | 'aborted';

export class TmdbError extends Error {
  readonly kind: TmdbErrorKind;
  readonly status: number | undefined;

  constructor(kind: TmdbErrorKind, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'TmdbError';
    this.kind = kind;
    this.status = options?.status;
  }

  get retryable(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') return true;
    return this.kind === 'http' && (this.status === 429 || (this.status ?? 0) >= 500);
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof TmdbError && error.kind === 'aborted') ||
    (error instanceof DOMException && error.name === 'AbortError')
  );
}

/** Message safe to show to end users; technical details stay in the logs. */
export function toUserMessage(error: unknown): string {
  if (!(error instanceof TmdbError)) return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  switch (error.kind) {
    case 'config':
      return 'Falta configurar la clave de TMDB (VITE_TMDB_API_KEY en .env.local).';
    case 'network':
      return 'No pudimos conectarnos. Revisa tu conexión a internet.';
    case 'timeout':
      return 'El servidor tardó demasiado en responder. Inténtalo de nuevo.';
    case 'http':
      if (error.status === 401) return 'La clave de TMDB no es válida.';
      if (error.status === 404) return 'No encontramos este título.';
      if (error.status === 429) return 'Demasiadas solicitudes. Espera un momento.';
      return 'El servicio no está disponible en este momento.';
    default:
      return 'Recibimos una respuesta inesperada del servidor.';
  }
}
