import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';

// Get all boards
export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find().populate({
      path: 'lists',
      populate: { path: 'cards' }
    }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single board
export const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate({
      path: 'lists',
      populate: { path: 'cards' }
    });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create board
export const createBoard = async (req, res) => {
  try {
    const board = new Board({
      title: req.body.title
    });
    const newBoard = await board.save();
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update board
export const updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    if (req.body.title) board.title = req.body.title;
    if (req.body.lists) board.lists = req.body.lists;
    
    const updatedBoard = await board.save();
    res.json(updatedBoard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete board
export const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Delete all lists and cards associated with this board
    const lists = await List.find({ boardId: req.params.id });
    for (const list of lists) {
      await Card.deleteMany({ listId: list._id });
    }
    await List.deleteMany({ boardId: req.params.id });
    
    await board.deleteOne();
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
