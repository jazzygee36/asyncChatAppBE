import { Server as SocketIoServer } from 'socket.io';
const setupSocket = (server: any) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
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

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with sockect ID: ${socket.id}`);
    } else {
      console.log('userId not provided during connection');
    }
    socket.on('disconnect', () => disconnect(socket));
  });
};

export default setupSocket;
