import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['boards/fetchBoards/fulfilled'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
