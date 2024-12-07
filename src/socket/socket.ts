import { Server as SocketIoServer } from 'socket.io';
import Messages from '../modules/models/messages.schema';
const setupSocket = (server: any) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: `http://localhost:3000`,
      // origin: `https://asyncchat.netlify.app/`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  const userSocketMap = new Map();

  const disconnect = (socket: any) => {
    console.log(`Client Disconnected ${socket.id}`);
    for (const [userId, sockectId] of userSocketMap.entries()) {
      if (sockectId === sockectId) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };
  const sendMessage = async (message: any) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createMessage = await Messages.create(message);
    const messageData = await Messages.findById(createMessage._id)
      .populate('sender', 'id email username image')
      .populate('recipient', 'id email username image');

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveMessage', messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit('receiveMessage', messageData);
    }
  };
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with sockect ID: ${socket.id}`);
    } else {
      console.log('userId not provided during connection');
    }
    socket.on('sendMessage', sendMessage);
    socket.on('disconnect', () => disconnect(socket));
  });
};

export default setupSocket;
