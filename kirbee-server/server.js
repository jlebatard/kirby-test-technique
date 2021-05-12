const io = require('socket.io')(3006, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', function(socket) {
  console.log('client connect - ', socket.id);

  socket.on('reconnect', (attemptNumber) => {
    console.log('client reconnect - ', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('client disconnect - ', socket.id);
  });

  socket.on('ping', () => {
    console.log('ping received');
    socket.emit('pong');
  });
});