import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchListsByBoard = createAsyncThunk(
  'lists/fetchByBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.API_URL}/lists/board/${boardId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createList = createAsyncThunk(
  'lists/create',
  async ({ boardId, title }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.API_URL}/lists`, { boardId, title });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${process.env.API_URL}/lists/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteList = createAsyncThunk(
  'lists/delete',
  async (listId, { rejectWithValue }) => {
    try {
      await axios.delete(`${process.env.API_URL}/lists/${listId}`);
      return listId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
