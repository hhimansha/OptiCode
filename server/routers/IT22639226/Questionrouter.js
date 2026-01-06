import express from 'express';
import { generateInterviewQuestions } from '../../controllers/IT22639226/Interviewquestion.js';

const Questionrouter = express.Router();
Questionrouter.post('/generate-questions', generateInterviewQuestions);

export default Questionrouter;
