import { createSelector } from 'reselect';

const selectCardsState = state => state.cards;

export const selectAllCards = createSelector(
  [selectCardsState],
  (cardsState) => cardsState.allIds.map(id => cardsState.byId[id])
);

export const selectCardById = createSelector(
  [selectCardsState, (_, cardId) => cardId],
  (cardsState, cardId) => cardsState.byId[cardId]
);

export const selectCardsByList = createSelector(
  [selectCardsState, (_, listId) => listId],
  (cardsState, listId) => {
    return Object.values(cardsState.byId)
      .filter(card => card.listId === listId)
      .sort((a, b) => a.order - b.order);
  }
);

export const selectCardsLoading = createSelector(
  [selectCardsState],
  (cardsState) => cardsState.loading
);

export const selectAILoading = createSelector(
  [selectCardsState],
  (cardsState) => cardsState.aiLoading
);

export const selectCardsError = createSelector(
  [selectCardsState],
  (cardsState) => cardsState.error
);
