import { createSlice } from '@reduxjs/toolkit';
import {
  fetchBoards,
  fetchBoard,
  createBoard,
  updateBoard,
  deleteBoard
} from '../actions/boardActions';

const initialState = {
  byId: {},
  allIds: [],
  currentBoardId: null,
  loading: false,
  error: null
};

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setCurrentBoard: (state, action) => {
      state.currentBoardId = action.payload;
    },
    addListToBoard: (state, action) => {
      const { boardId, listId } = action.payload;
      if (state.byId[boardId]) {
        state.byId[boardId].lists.push(listId);
      }
    },
    removeListFromBoard: (state, action) => {
      const { boardId, listId } = action.payload;
      if (state.byId[boardId]) {
        state.byId[boardId].lists = state.byId[boardId].lists.filter(id => id !== listId);
      }
    },
    updateBoardLists: (state, action) => {
      const { boardId, lists } = action.payload;
      if (state.byId[boardId]) {
        state.byId[boardId].lists = lists;
      }
    },
    clearBoardError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.byId = {};
        state.allIds = [];
        action.payload.forEach(board => {
          state.byId[board._id] = {
            id: board._id,
            title: board.title,
            lists: board.lists.map(list => list._id || list),
            createdAt: board.createdAt
          };
          state.allIds.push(board._id);
        });
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        const board = action.payload;
        state.byId[board._id] = {
          id: board._id,
          title: board.title,
          lists: board.lists.map(list => list._id || list),
          createdAt: board.createdAt
        };
        if (!state.allIds.includes(board._id)) {
          state.allIds.push(board._id);
        }
        state.currentBoardId = board._id;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        const board = action.payload;
        state.byId[board._id] = {
          id: board._id,
          title: board.title,
          lists: [],
          createdAt: board.createdAt
        };
        state.allIds.push(board._id);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        const board = action.payload;
        if (state.byId[board._id]) {
          state.byId[board._id] = {
            ...state.byId[board._id],
            title: board.title,
            lists: board.lists.map(list => list._id || list)
          };
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        const boardId = action.payload;
        delete state.byId[boardId];
        state.allIds = state.allIds.filter(id => id !== boardId);
        if (state.currentBoardId === boardId) {
          state.currentBoardId = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  }
});

export const {
  setCurrentBoard,
  addListToBoard,
  removeListFromBoard,
  updateBoardLists,
  clearBoardError
} = boardSlice.actions;

export default boardSlice.reducer;
