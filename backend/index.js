// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import http from 'http';
// import { Server } from 'socket.io'; 
// import connectDB from './mongodb/connect.js';
// import alumniAuthRoutes from './routes/alumniAuth.js';
// import studentAuthRoutes from './routes/studentAuth.js';
// import adminAuthRoutes from './routes/adminAuth.js';
// import postRoutes from './routes/postRoutes.js';
// import trainingPostRoutes from './routes/trainingPostRoutes.js';
// import chatRoutes from './routes/chatRoutes.js';
// import verifyUser from './routes/verifyUser.js';
// import messageRoutes from './routes/messageRoutes.js';
// dotenv.config();
// const app = express();

// app.use(express.json({ limit: '50mb' }));
// app.use(cors());

// // Import and use route handlers
// app.use('/api/auth/verify', verifyUser);
// app.use('/api/auth/alumni', alumniAuthRoutes);
// app.use('/api/auth/student', studentAuthRoutes);
// app.use('/api/auth/admin', adminAuthRoutes);
// app.use('/api/v1/post', postRoutes);
// app.use('/api/v1/training', trainingPostRoutes);
// app.use('/api/v1/chats', chatRoutes);
// app.use('/api/v1/message',messageRoutes);


// app.get('/', async (req, res) => {
//   res.status(200).json({
//     message: 'Hello',
//   });
// });

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: `http://localhost:${process.env.PORT}`,
//   },
// });

// io.on('connection', (socket) => {
//   console.log('Connected to socket.io');

//   socket.on('setup', (userData) => {
//     socket.join(userData._id);
//     socket.emit('connected');
//   });

//   socket.on('join chat', (room) => {
//     socket.join(room);
//     console.log('User Joined Room: ' + room);
//   });

//   socket.on('typing', (room) => socket.in(room).emit('typing'));
//   socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

//   socket.on('new message', (newMessageReceived) => {
//     var chat = newMessageReceived.chat;

//     if (!chat.users) return console.log('chat.users not defined');

//     chat.users.forEach((user) => {
//       if (user._id == newMessageReceived.sender._id) return;

//       socket.in(user._id).emit('message received', newMessageReceived);
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// const startServer = async () => {
//   try {
//     connectDB(process.env.MONGODB_URL);
//     server.listen(process.env.PORT, () =>
//       console.log(`Server is running on port http://localhost:${process.env.PORT}`)
//     );
//   } catch (e) {
//     console.log(e);
//   }
// };

// startServer();

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './mongodb/connect.js';
import alumniAuthRoutes from './routes/alumniAuth.js';
import studentAuthRoutes from './routes/studentAuth.js';
import adminAuthRoutes from './routes/adminAuth.js';
import postRoutes from './routes/postRoutes.js';
import trainingPostRoutes from './routes/trainingPostRoutes.js';
import verifyUser from './routes/verifyUser.js';
dotenv.config();
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.use('/api/auth/verify', verifyUser);
app.use('/api/auth/alumni', alumniAuthRoutes);
app.use('/api/auth/student', studentAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/training', trainingPostRoutes);

app.get('/', async (req, res) => {
  res.status(200).json({
    message: 'Hello',
  });
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(process.env.PORT, () =>
      console.log(`Server is running on port http://localhost:${process.env.PORT}`)
    );
  } catch (e) {
    console.log(e);
  }
};

startServer();
