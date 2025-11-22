import express from 'express';
import { register, login } from '../controllers/User.js';
// import Userauth from '../middelwares/Userauth.js'; // Comment out for now

const Userrouter = express.Router();

Userrouter.post('/register', register);
Userrouter.post('/login', login);

export default Userrouter;