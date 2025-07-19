const { Server } = require('socket.io');
const io = new Server(process.env.PORT || 3000, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const nameToSocketIdMap = new Map();
const socketidToNameMap = new Map();

io.on('connection', (socket) => {
  console.log(`Socket Connected`, socket.id);
  
  socket.on("join-room", (data) => {
    const { name, roomId } = data;
    nameToSocketIdMap.set(name, socket.id);
    socketidToNameMap.set(socket.id, name);
    io.to(roomId).emit("user-joined", { name, id: socket.id });
    socket.join(roomId);
    io.to(socket.id).emit("joined-room", data);
  });
});