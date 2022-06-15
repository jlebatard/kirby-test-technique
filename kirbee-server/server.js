const io = require('socket.io')(3006, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let players = []
let go = false // détermine si les joueurs peuvent attaquer ou non
let finish = false // détermine si la partie est finie ou non

io.on('connection', function (socket) {
  console.log('client connect - ', socket.id);

  // action lorsqu'un client se reconnecte
  socket.on('reconnect', () => {
    console.log('client reconnect - ', socket.id);
  });

  // action lorsqu'un client se déconnecte
  socket.on('disconnect', () => {
    console.log('client disconnect - ', socket.id);

    // retire le joueur qui est parti
    players = players.filter(player => player.id !== socket.id)
    socket.broadcast.emit("disconnected")
  });

  // action lorsqu'un joueur rejoint la partie
  socket.on('join', () => {
    // partie complète
    if (players.length >= 2) {
      socket.emit('full')
    }
    // place(s) disponible(s)
    else {
      let player = {
        id: socket.id,
        ready: false
      }
      players.push(player)
      socket.emit('joined', players.length);
      console.log("Un joueur a rejoint la partie")
    }
  });

  // action quand un joueur clique sur "ready"
  socket.on('playerReady', () => {
    let playerReady = players.find(player => player.id == socket.id)
    playerReady.ready = true
    socket.emit('playerReady');
    console.log("Le joueur " + (players.findIndex(player => player.id == socket.id) + 1) + " a rejoint la partie")
  });

  // action lorsque les joueurs attendent
  socket.on('waiting', async () => {
    if (players.filter(player => player.ready === true).length >= 2) {
      console.log("Partie commencé")
      io.to(players[0].id).emit('inGame');
      io.to(players[1].id).emit('inGame');

      finish = false

      // compte à rebours
      await sleep(Math.floor(Math.random() * 6000) + 2000);

      // si la partie n'est pas fini, autorise les joueurs à attaquer
      if (!finish) {
        go = true

        console.log("les joueurs peuvent attaquer")
        io.to(players[0].id).emit('go');
        io.to(players[1].id).emit('go');
      }
    }
  })

  // action lorsqu'un joueur a attaqué
  socket.on('attack', async () => {
    console.log("le joueur " + (players.findIndex(player => player.id == socket.id) + 1) + " a attaqué")
    console.log("go", go)
    let winner = players.findIndex(player => go ? player.id === socket.id : player.id !== socket.id) + 1
    io.to(players[0].id).emit('finish', winner);
    io.to(players[1].id).emit('finish', winner);

    // remet les joueurs en "non-prêt"
    players.forEach(player => player.ready = false)
    console.log("partie terminée")
    go = false
    finish = true
  })
});


// fonction qui permet d'attendre
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}