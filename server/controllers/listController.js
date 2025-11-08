import List from '../models/List.js';
import Board from '../models/Board.js';
import Card from '../models/Card.js';

// Get lists by board
export const getListsByBoard = async (req, res) => {
  try {
    const lists = await List.find({ boardId: req.params.boardId })
      .populate('cards')
      .sort({ order: 1 });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create list
export const createList = async (req, res) => {
  try {
    const board = await Board.findById(req.body.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const list = new List({
      title: req.body.title,
      boardId: req.body.boardId,
      order: req.body.order || board.lists.length
    });
    
    const newList = await list.save();
    
    // Add list to board
    board.lists.push(newList._id);
    await board.save();
    
    res.status(201).json(newList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update list
export const updateList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    if (req.body.title) list.title = req.body.title;
    if (req.body.cards) list.cards = req.body.cards;
    if (req.body.order !== undefined) list.order = req.body.order;
    
    const updatedList = await list.save();
    res.json(updatedList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete list
export const deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Delete all cards in this list
    await Card.deleteMany({ listId: req.params.id });
    
    // Remove list from board
    await Board.findByIdAndUpdate(list.boardId, {
      $pull: { lists: req.params.id }
    });
    
    await list.deleteOne();
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
