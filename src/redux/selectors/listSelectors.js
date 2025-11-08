import { createSelector } from 'reselect';

const selectListsState = state => state.lists;

export const selectAllLists = createSelector(
  [selectListsState],
  (listsState) => listsState.allIds.map(id => listsState.byId[id])
);

export const selectListById = createSelector(
  [selectListsState, (_, listId) => listId],
  (listsState, listId) => listsState.byId[listId]
);

export const selectListsByBoard = createSelector(
  [selectListsState, (_, boardId) => boardId],
  (listsState, boardId) => {
    return Object.values(listsState.byId)
      .filter(list => list.boardId === boardId)
      .sort((a, b) => a.order - b.order);
  }
);

export const selectListsLoading = createSelector(
  [selectListsState],
  (listsState) => listsState.loading
);

export const selectListsError = createSelector(
  [selectListsState],
  (listsState) => listsState.error
);
