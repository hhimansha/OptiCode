import express from 'express';
import { startAiInterview, endInterview } from '../../controllers/AI_interview.js';

const Ai_interviewrouter = express.Router();

Ai_interviewrouter.post('/start-ai-interview', startAiInterview);
Ai_interviewrouter.post('/end-interview', endInterview);

export default Ai_interviewrouter;