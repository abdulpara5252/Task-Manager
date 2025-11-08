import { createSelector } from 'reselect';

const selectBoardsState = state => state.boards;

export const selectAllBoards = createSelector(
  [selectBoardsState],
  (boardsState) => boardsState.allIds.map(id => boardsState.byId[id])
);

export const selectCurrentBoardId = createSelector(
  [selectBoardsState],
  (boardsState) => boardsState.currentBoardId
);

export const selectCurrentBoard = createSelector(
  [selectBoardsState, selectCurrentBoardId],
  (boardsState, currentBoardId) => 
    currentBoardId ? boardsState.byId[currentBoardId] : null
);

export const selectBoardById = createSelector(
  [selectBoardsState, (_, boardId) => boardId],
  (boardsState, boardId) => boardsState.byId[boardId]
);

export const selectBoardsLoading = createSelector(
  [selectBoardsState],
  (boardsState) => boardsState.loading
);

export const selectBoardsError = createSelector(
  [selectBoardsState],
  (boardsState) => boardsState.error
);
