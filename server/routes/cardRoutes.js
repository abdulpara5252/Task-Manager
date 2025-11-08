import express from 'express';
import {
  getCardsByList,
  createCard,
  updateCard,
  deleteCard
} from '../controllers/cardController.js';

const router = express.Router();

router.get('/list/:listId', getCardsByList);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;
