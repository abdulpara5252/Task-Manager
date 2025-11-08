import Card from '../models/Card.js';
import List from '../models/List.js';

// Get cards by list
export const getCardsByList = async (req, res) => {
  try {
    const cards = await Card.find({ listId: req.params.listId }).sort({ order: 1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create card
export const createCard = async (req, res) => {
  try {
    const list = await List.findById(req.body.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    const card = new Card({
      title: req.body.title,
      description: req.body.description || '',
      listId: req.body.listId,
      order: req.body.order || list.cards.length
    });
    
    const newCard = await card.save();
    
    // Add card to list
    list.cards.push(newCard._id);
    await list.save();
    
    res.status(201).json(newCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update card
export const updateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    if (req.body.title) card.title = req.body.title;
    if (req.body.description !== undefined) card.description = req.body.description;
    if (req.body.subtasks) card.subtasks = req.body.subtasks;
    if (req.body.order !== undefined) card.order = req.body.order;
    
    // Handle moving card to different list
    if (req.body.listId && req.body.listId !== card.listId.toString()) {
      const oldList = await List.findById(card.listId);
      const newList = await List.findById(req.body.listId);
      
      if (!newList) {
        return res.status(404).json({ message: 'New list not found' });
      }
      
      // Remove from old list
      if (oldList) {
        oldList.cards = oldList.cards.filter(c => c.toString() !== card._id.toString());
        await oldList.save();
      }
      
      // Add to new list
      newList.cards.push(card._id);
      await newList.save();
      
      card.listId = req.body.listId;
    }
    
    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete card
export const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // Remove card from list
    await List.findByIdAndUpdate(card.listId, {
      $pull: { cards: req.params.id }
    });
    
    await card.deleteOne();
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
