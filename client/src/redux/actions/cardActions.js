import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API_URL from '../../config/api';

export const fetchCardsByList = createAsyncThunk(
  'cards/fetchByList',
  async (listId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cards/list/${listId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCard = createAsyncThunk(
  'cards/create',
  async ({ listId, title, description }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cards`, { listId, title, description });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCard = createAsyncThunk(
  'cards/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/cards/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCard = createAsyncThunk(
  'cards/delete',
  async (cardId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/cards/${cardId}`);
      return cardId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generateAISubtasks = createAsyncThunk(
  'cards/generateSubtasks',
  async ({ cardId, title, description }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/ai/subtasks`, { title, description });
      return { cardId, subtasks: response.data.subtasks };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
