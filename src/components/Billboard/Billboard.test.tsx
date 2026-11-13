import { act, fireEvent, render, screen } from '@testing-library/react';
import type { CatalogService } from '../../services/catalog/catalogService';
import { CatalogServiceContext } from '../../services/CatalogServiceContext';
import type { TitleDetails } from '../../domain/title';
import { TitleActionsContext } from '../../state/titleActions';
import { Billboard } from './Billboard';

const details: TitleDetails = {
  id: 1,
  mediaType: 'tv',
  name: 'Featured Show',
  overview: 'A great show',
  backdropPath: '/b.jpg',
  posterPath: null,
  releaseYear: 2024,
  voteAverage: 8,
  genreIds: [],
  genres: [],
  tagline: '',
  runtimeMinutes: null,
  seasons: 2,
  logoPath: null,
  trailerKey: 'abc123',
  certification: '16+',
  cast: [],
  similar: [],
};

function mockMatchMedia(matchesFor: (query: string) => boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: matchesFor(query), media: query }));
}

function renderBillboard(detailsOpen = false) {
  const service = { loadDetails: vi.fn().mockResolvedValue(details) } as unknown as CatalogService;
  return render(
    <CatalogServiceContext value={service}>
      <TitleActionsContext value={{ openDetails: vi.fn(), detailsOpen }}>
        <Billboard title={details} />
      </TitleActionsContext>
    </CatalogServiceContext>,
  );
}

describe('Billboard trailer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts a muted trailer after a pause and lets the user toggle sound', async () => {
    mockMatchMedia((query) => query.includes('min-width'));
    renderBillboard();
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByTitle('Avance del título destacado')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    const iframe = screen.getByTitle('Avance del título destacado') as HTMLIFrameElement;
    expect(iframe.src).toContain('/embed/abc123');
    expect(iframe.src).toContain('mute=1');

    const postMessage = vi.spyOn(iframe.contentWindow as Window, 'postMessage').mockImplementation(() => {});
    fireEvent.load(iframe);
    fireEvent.click(screen.getByRole('button', { name: 'Activar sonido' }));

    const commands = postMessage.mock.calls.map(([message]) => JSON.parse(String(message)).func);
    expect(commands).toContain('unMute');
    expect(screen.getByRole('button', { name: 'Silenciar' })).toBeInTheDocument();
  });

  it('does not autoplay when the user prefers reduced motion', async () => {
    mockMatchMedia(() => true);
    renderBillboard();
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByTitle('Avance del título destacado')).not.toBeInTheDocument();
    expect(screen.getByText('16+')).toBeInTheDocument();
  });

  it('waits while the details modal is open', async () => {
    mockMatchMedia((query) => query.includes('min-width'));
    renderBillboard(true);
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByTitle('Avance del título destacado')).not.toBeInTheDocument();
  });
});
