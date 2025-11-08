import express from 'express';
import {
  generateSubtasks,
  generateBoardSummary
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/subtasks', generateSubtasks);
router.post('/summary', generateBoardSummary);

export default router;
