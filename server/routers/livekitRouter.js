// File: routers/livekitRouter.js
import express from 'express';
import { v4 as uuid } from 'uuid';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const router = express.Router();
const LiveKITHost = process.env.LIVEKIT_URL;
const LivekitSecret = process.env.LIVEKIT_API_SECRET;
const LiveKitAPi = process.env.LIVEKIT_API_KEY;

const createAccessToken = async (userInfo, grant) => {
  const accessToken = new AccessToken(LiveKitAPi, LivekitSecret, {
    identity: userInfo.identity,
    name: userInfo.name
  });
  
  accessToken.addGrant(grant);
  return await accessToken.toJwt();
};

// GET /api/livekit
router.get('/', async (req, res) => {
  try {
    // Extract userId from query parameters - FIXED THIS LINE
    const userId = req.query.userId; // Simple direct access to query parameter
    
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }
    
    const roomName = uuid();
    
    if (!LiveKITHost || !LivekitSecret || !LiveKitAPi) {
      throw new Error('LiveKit configuration is missing');
    }
    
    const roomClient = new RoomServiceClient(LiveKITHost, LiveKitAPi, LivekitSecret);
    const room = await roomClient.createRoom({ 
      name: roomName
    });

    const grant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true  
    };
      
    const token = await createAccessToken({
      identity: userId,
      name: userId
    }, grant);
    
    // Return JSON response
    return res.status(200).json({ roomName, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;