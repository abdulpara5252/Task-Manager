import { createSlice } from '@reduxjs/toolkit';
import {
  fetchListsByBoard,
  createList,
  updateList,
  deleteList
} from '../actions/listActions';

const initialState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null
};

const listSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    addCardToList: (state, action) => {
      const { listId, cardId } = action.payload;
      if (state.byId[listId]) {
        state.byId[listId].cards.push(cardId);
      }
    },
    removeCardFromList: (state, action) => {
      const { listId, cardId } = action.payload;
      if (state.byId[listId]) {
        state.byId[listId].cards = state.byId[listId].cards.filter(id => id !== cardId);
      }
    },
    updateListCards: (state, action) => {
      const { listId, cards } = action.payload;
      if (state.byId[listId]) {
        state.byId[listId].cards = cards;
      }
    },
    reorderLists: (state, action) => {
      const { lists } = action.payload;
      lists.forEach((listId, index) => {
        if (state.byId[listId]) {
          state.byId[listId].order = index;
        }
      });
    },
    clearListError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListsByBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListsByBoard.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach(list => {
          state.byId[list._id] = {
            id: list._id,
            title: list.title,
            boardId: list.boardId,
            cards: list.cards.map(card => card._id || card),
            order: list.order
          };
          if (!state.allIds.includes(list._id)) {
            state.allIds.push(list._id);
          }
        });
      })
      .addCase(fetchListsByBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.loading = false;
        const list = action.payload;
        state.byId[list._id] = {
          id: list._id,
          title: list.title,
          boardId: list.boardId,
          cards: [],
          order: list.order
        };
        state.allIds.push(list._id);
      })
      .addCase(createList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateList.fulfilled, (state, action) => {
        const list = action.payload;
        if (state.byId[list._id]) {
          state.byId[list._id] = {
            ...state.byId[list._id],
            title: list.title,
            cards: list.cards.map(card => card._id || card),
            order: list.order
          };
        }
      })
      .addCase(updateList.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        const listId = action.payload;
        delete state.byId[listId];
        state.allIds = state.allIds.filter(id => id !== listId);
      })
      .addCase(deleteList.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  }
});

export const {
  addCardToList,
  removeCardFromList,
  updateListCards,
  reorderLists,
  clearListError
} = listSlice.actions;

export default listSlice.reducer;
