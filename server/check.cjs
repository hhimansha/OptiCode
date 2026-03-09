const mongoose = require('mongoose');
require('dotenv').config();
console.log('URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected OK');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).limit(5).toArray();
  users.forEach(u => console.log('USER:', u._id.toString(), u.email || ''));
  const prog = await db.collection('studentprogresses').find({}).limit(5).toArray();
  prog.forEach(p => console.log('PROGRESS:', p.userId && p.userId.toString(), p.skillLevel));
  mongoose.disconnect();
}).catch(e => console.log('ERROR:', e.message));
