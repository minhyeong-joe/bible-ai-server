import express from 'express';
import { getAIResponse } from '../controllers/response.js';

const router = express.Router();

router.post('/response', getAIResponse);

export default router;