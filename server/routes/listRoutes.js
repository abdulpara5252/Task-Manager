import express from 'express';
import {
  getListsByBoard,
  createList,
  updateList,
  deleteList
} from '../controllers/listController.js';

const router = express.Router();

router.get('/board/:boardId', getListsByBoard);
router.post('/', createList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

export default router;
