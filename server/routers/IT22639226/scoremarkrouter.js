import express from "express";
import { getUserInterviewResults } from "../../controllers/IT22639226/Scoredisplay.js"; // Adjust the path to where your controller is saved
import userAuth from '../../middlewares/Userauth.js';// Adjust the path to where your middleware is saved

const router = express.Router();

// Apply the userAuth middleware to protect the route.
// When a user hits this endpoint, userAuth checks the cookies, 
// grabs the ID, and passes it to getUserInterviewResults.
router.get("/my-results", userAuth, getUserInterviewResults);

export default router;