import { combineReducers } from '@reduxjs/toolkit';
import boardReducer from './boardReducer';
import listReducer from './listReducer';
import cardReducer from './cardReducer';

const rootReducer = combineReducers({
  boards: boardReducer,
  lists: listReducer,
  cards: cardReducer
});

export default rootReducer;
