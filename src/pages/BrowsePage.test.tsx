import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import type { CatalogService } from '../services/catalog/catalogService';
import { CatalogServiceContext } from '../services/CatalogServiceContext';
import { TmdbError } from '../services/tmdb/errors';
import { TitleActionsContext } from '../state/titleActions';
import { BrowsePage } from './BrowsePage';

const featured = {
  id: 1,
  mediaType: 'tv' as const,
  name: 'Featured Show',
  overview: 'A great show',
  backdropPath: '/b.jpg',
  posterPath: '/p.jpg',
  releaseYear: 2024,
  voteAverage: 8.1,
  genreIds: [18],
};

function renderWith(service: Partial<CatalogService>, children: ReactNode) {
  const openDetails = vi.fn();
  render(
    <CatalogServiceContext value={service as CatalogService}>
      <TitleActionsContext value={{ openDetails, detailsOpen: false }}>{children}</TitleActionsContext>
    </CatalogServiceContext>,
  );
  return { openDetails };
}

describe('BrowsePage', () => {
  it('renders the billboard and rows, and opens details', async () => {
    const service: Partial<CatalogService> = {
      loadView: vi.fn().mockResolvedValue({
        featured,
        rows: [{ id: 'r1', title: 'Tendencias ahora', variant: 'default', items: [featured] }],
      }),
      loadDetails: vi.fn().mockReturnValue(new Promise(() => {})),
    };
    const { openDetails } = renderWith(service, <BrowsePage view="home" />);

    expect(await screen.findByRole('heading', { name: 'Tendencias ahora' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Featured Show' })).toBeInTheDocument();
    expect(screen.getByText('81% para ti')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Más información/ }));
    expect(openDetails).toHaveBeenCalledWith(featured);

    await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }));
    expect(openDetails).toHaveBeenLastCalledWith(featured, { autoplay: true });
  });

  it('shows a friendly error and retries', async () => {
    const loadView = vi
      .fn()
      .mockRejectedValueOnce(new TmdbError('network', 'offline'))
      .mockResolvedValueOnce({ featured: null, rows: [{ id: 'r1', title: 'Comedias', variant: 'default', items: [featured] }] });
    renderWith({ loadView, loadDetails: vi.fn() }, <BrowsePage view="home" />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Revisa tu conexión');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: 'Comedias' })).toBeInTheDocument();
    expect(loadView).toHaveBeenCalledTimes(2);
  });
});
