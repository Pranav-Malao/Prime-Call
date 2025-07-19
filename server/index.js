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

  socket.on("user-call", ({ to, offer }) => {
    io.to(to).emit("incoming-call", { from: socket.id, offer });
  });

  socket.on("call-accepted", ({ to, ans }) => {
    io.to(to).emit("call-accepted", { from: socket.id, ans });
  });

  socket.on("peer-nego-needed", ({ to, offer }) => {
    console.log("peer-nego-needed", offer);
    io.to(to).emit("peer-nego-needed", { from: socket.id, offer });
  });

  socket.on("peer-nego-done", ({ to, ans }) => {
    console.log("peer-nego-done", ans);
    io.to(to).emit("peer-nego-final", { from: socket.id, ans });
  });
});