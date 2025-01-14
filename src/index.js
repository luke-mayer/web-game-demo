import { Server } from "socket.io";
import { createServer } from "node:http";
import express from "express";

const port = process.env.PORT;

const app = express();
const server = createServer(app);
const io = new Server(server);

const TICK_RATE = 60;

const players = [];
const inputsMap = {};

async function main() {
  io.on("connect", (socket) => {
    console.log("connect on socket with id: ", socket.id);

    inputsMap[socket.id] = {
      click: false,
    };

    players.push({
      id: socket.id,
      x: 0,
      y: 0,
      angle: 0,
      flashlightOn: false,
    });

    socket.on("inputs", (inputs) => {
      inputsMap[socket.id] = inputs;
    });
  });

  app.use(express.static("public"));
  server.listen(port);

  setInterval(() => {}, 1000 / TICK_RATE);
}

main();
