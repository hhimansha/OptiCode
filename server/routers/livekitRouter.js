import express from 'express';
import { v4 as uuid } from 'uuid';
import { AccessToken } from 'livekit-server-sdk';
import userAuth from '../middlewares/Userauth.js'; // Adjust path as needed

const router = express.Router();

// Apply userAuth middleware here so req.userId is available
router.get('/', userAuth, async (req, res) => {
  try {
    const userId = req.userId; // Populated by userAuth middleware
    const roomName = `room-${uuid()}`;
    
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: userId, // This is what the Python Agent will read
      name: userId,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    return res.status(200).json({ roomName, token: jwt });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
});

export default router;