import express from 'express';
import { generateInterviewQuestions } from '../../controllers/IT22639226/Interviewquestion.js';
//import Userauth from '../../m';
import userAuth from '../../middlewares/Userauth.js';



const Questionrouter = express.Router();
Questionrouter.post('/generate-questions',  userAuth, generateInterviewQuestions);

export default Questionrouter;
