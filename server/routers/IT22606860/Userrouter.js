import express from 'express';
import { register,login } from '../../controllers/IT22606860/User.js';
import userAuth from '../../middelwares/Userauth.js';

const Userrouter = express.Router();

Userrouter.post('/register', register);
Userrouter.post('/login', login);

export default Userrouter;
