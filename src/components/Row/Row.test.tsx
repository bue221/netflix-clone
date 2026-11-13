import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CatalogRow, Title } from '../../domain/title';
import { TitleActionsContext } from '../../state/titleActions';
import { Row } from './Row';

const title = (id: number): Title => ({
  id,
  mediaType: 'movie',
  name: `Movie ${id}`,
  overview: '',
  backdropPath: `/b${id}.jpg`,
  posterPath: null,
  releaseYear: 2024,
  voteAverage: 7,
  genreIds: [],
});

const row: CatalogRow = { id: 'r', title: 'Tendencias', variant: 'default', items: [title(1), title(2), title(3)] };

function renderRow() {
  const openDetails = vi.fn();
  render(
    <TitleActionsContext value={{ openDetails, detailsOpen: false }}>
      <button type="button">antes</button>
      <Row row={row} />
      <button type="button">después</button>
    </TitleActionsContext>,
  );
  return { openDetails };
}

describe('Row keyboard navigation', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('is a single tab stop navigated with arrow keys', async () => {
    const user = userEvent.setup();
    const { openDetails } = renderRow();

    await user.click(screen.getByRole('button', { name: 'antes' }));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Movie 1' })).toHaveFocus();

    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Movie 3' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Movie 1' })).toHaveFocus();
    await user.keyboard('{End}{Enter}');
    expect(openDetails).toHaveBeenCalledWith(row.items[2]);

    await user.tab();
    expect(screen.getByRole('button', { name: 'después' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Movie 3' })).toHaveFocus();
  });
});
