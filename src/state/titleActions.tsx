import { createContext, useContext } from 'react';
import type { Title } from '../domain/title';

export interface OpenDetailsOptions {
  autoplay?: boolean;
}

export interface TitleActions {
  openDetails(title: Title, options?: OpenDetailsOptions): void;
  /** Background media (e.g. the billboard trailer) pauses while the details modal is open. */
  detailsOpen: boolean;
}

export const TitleActionsContext = createContext<TitleActions | null>(null);

export function useTitleActions(): TitleActions {
  const actions = useContext(TitleActionsContext);
  if (!actions) throw new Error('useTitleActions must be used inside <TitleActionsContext>');
  return actions;
}
