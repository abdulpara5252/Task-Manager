import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCardsByList,
  createCard,
  updateCard,
  deleteCard,
  generateAISubtasks
} from '../actions/cardActions';

const initialState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
  aiLoading: false
};

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    moveCard: (state, action) => {
      const { cardId, newListId } = action.payload;
      if (state.byId[cardId]) {
        state.byId[cardId].listId = newListId;
      }
    },
    reorderCards: (state, action) => {
      const { cards } = action.payload;
      cards.forEach((cardId, index) => {
        if (state.byId[cardId]) {
          state.byId[cardId].order = index;
        }
      });
    },
    toggleSubtask: (state, action) => {
      const { cardId, subtaskIndex } = action.payload;
      if (state.byId[cardId] && state.byId[cardId].subtasks[subtaskIndex]) {
        state.byId[cardId].subtasks[subtaskIndex].completed = 
          !state.byId[cardId].subtasks[subtaskIndex].completed;
      }
    },
    clearCardError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCardsByList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardsByList.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach(card => {
          state.byId[card._id] = {
            id: card._id,
            title: card.title,
            description: card.description,
            listId: card.listId,
            subtasks: card.subtasks || [],
            order: card.order
          };
          if (!state.allIds.includes(card._id)) {
            state.allIds.push(card._id);
          }
        });
      })
      .addCase(fetchCardsByList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.loading = false;
        const card = action.payload;
        state.byId[card._id] = {
          id: card._id,
          title: card.title,
          description: card.description,
          listId: card.listId,
          subtasks: card.subtasks || [],
          order: card.order
        };
        state.allIds.push(card._id);
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        const card = action.payload;
        if (state.byId[card._id]) {
          state.byId[card._id] = {
            ...state.byId[card._id],
            title: card.title,
            description: card.description,
            listId: card.listId,
            subtasks: card.subtasks || [],
            order: card.order
          };
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        const cardId = action.payload;
        delete state.byId[cardId];
        state.allIds = state.allIds.filter(id => id !== cardId);
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(generateAISubtasks.pending, (state) => {
        state.aiLoading = true;
      })
      .addCase(generateAISubtasks.fulfilled, (state, action) => {
        state.aiLoading = false;
        const { cardId, subtasks } = action.payload;
        if (state.byId[cardId]) {
          state.byId[cardId].subtasks = subtasks;
        }
      })
      .addCase(generateAISubtasks.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const {
  moveCard,
  reorderCards,
  toggleSubtask,
  clearCardError
} = cardSlice.actions;

export default cardSlice.reducer;
