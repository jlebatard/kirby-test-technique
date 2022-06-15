<template>
  <div class="App" id="app">
    <div class="game">
      <div class="demo-scene">
        <div class="head-game">
          <div class="information">
            <div v-if="status === 'full'">
              <p>Full</p>
            </div>
            <div v-if="status === 'connected'">
              <p>connected</p>
              <button @click="useSocket('join')">Join</button>
            </div>
            <div v-if="status === 'joined' || status === 'playerReady'">
              <p>Joined as {{ name }}</p>
              <p>Waiting for a player</p>
              <button
                v-if="status === 'joined'"
                @click="useSocket('playerReady')"
              >
                Ready
              </button>
            </div>
            <div v-if="status === 'game'">
              <p>Joined as {{ name }}</p>
              <p>wait ...</p>
            </div>
            <div v-if="status === 'finish'">
              <p>Joined as {{ name }}</p>
              <p>{{ winner }} win!</p>
              <button @click="useSocket('playerReady')">Ready</button>
            </div>
            <div v-else>
              <p></p>
            </div>
          </div>
        </div>
        <div>
          <img
            height="66"
            :class="status !== 'go' ? 'invisible' : null"
            src="images/action-mark.png"
          />
        </div>
        <div class="playground">
          <template v-if="status === 'finish'">
            <div>
              <img
                height="66"
                :src="
                  winner === 'Kirby'
                    ? 'images/knight/knight_lose.png'
                    : 'images/knight/knight_win.png'
                "
              />
            </div>
            <div>
              <img
                height="66"
                :src="
                  winner === 'Kirby'
                    ? 'images/kirby/kirby_win.png'
                    : 'images/kirby/kirby_lose.png'
                "
              />
            </div>
          </template>
          <template v-else>
            <div>
              <img height="66" src="images/kirby/kirby_start.png" />
            </div>
            <div>
              <img height="66" src="images/knight/knight_start.png" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

const socket = io(`${location.protocol}//${location.hostname}:3006`);

export default {
  name: "App",

  data() {
    return {
      status: "connecting...",
      position: 0,
      name: "",
      winner: "",
    };
  },

  mounted() {
    let self = this;

    // permet d'attaquer quand on appuie sur une touche
    window.addEventListener("keyup", function () {
      if (self.status == "game" || self.status == "go") {
        self.useSocket("attack");
      }
    });

    // permet d'attaquer quand on clique à la souris
    window.addEventListener("click", function () {
      if (self.status == "game" || self.status == "go") {
        self.useSocket("attack");
      }
    });

    socket.on("connect", () => {
      this.status = "connected";
    });

    socket.on("disconnect", () => {
      this.status = "disconnected";
    });

    socket.on("reconnect", () => {
      this.status = "connected";
    });

    // action lorsque l'autre joueur quitte la partie
    socket.on("playerDisconnected", () => {
      this.position = 1;
      this.name = "Kirby";
    });

    // action lorsque le joueur a rejoint la partie
    socket.on("joined", (position) => {
      this.position = position;
      this.name = position == 1 ? "Kirby" : "Knight";
      this.status = "joined";
    });

    // action lorsqu'un joueur est prêt
    socket.on("playerReady", () => {
      this.status = "playerReady";
      this.useSocket("waiting");
    });

    // action lorsque tous les joueurs sont prêts
    socket.on("inGame", () => {
      this.status = "game";
    });

    // action lorsque la partie commence
    socket.on("go", () => {
      this.status = "go";
    });

    // action quand la partie est terminé
    socket.on("finish", (idWinner) => {
      this.winner = idWinner == 1 ? "Kirby" : "Knight";
      this.status = "finish";
    });

    // action lorsque le serveur indique que le serveur est plein
    socket.on("full", () => {
      this.status = "full";
    });
  },

  methods: {
    // methode qui permet d'envoyer une requête socket
    useSocket(value) {
      socket.emit(value);
    },
  },
};
</script>

<style scoped>
.App {
  width: 100%;
  height: 100%;
  background: url(/images/background.png) center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game {
  width: 512px;
  max-width: 90%;
  height: 444px;
  max-height: 90%;
  background: url(/images/background.png) center center;
  box-shadow: 0 0 9px rgb(0 0 0 / 60%), 0 0 0 9999px rgb(255 255 255 / 40%);
  border-radius: 5px;
  overflow: hidden;
}

.demo-scene {
  height: 100%;
  padding: 0.7rem;
  text-align: center;
  color: white;
}

.demo-scene p {
  margin-bottom: 2rem;
}

.playground {
  display: flex;
  justify-content: space-around;
}

.head-game {
  height: 35%;
}

.playground img {
  height: 66px;
}

.invisible {
  visibility: hidden;
}
</style>