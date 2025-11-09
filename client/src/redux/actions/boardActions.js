import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.API_URL}/boards`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'boards/fetchBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.API_URL}/boards/${boardId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (title, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.API_URL}/boards`, { title });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${process.env.API_URL}/boards/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      await axios.delete(`${process.env.API_URL}/boards/${boardId}`);
      return boardId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
