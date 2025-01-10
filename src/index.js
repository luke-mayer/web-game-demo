import { Server } from "socket.io";
import { createServer } from "node:http";
import express from "express";

const port = process.env.PORT;

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on("connect", (socket) => {
  console.log("connect on socket with id: ", socket.id);
});

app.use(express.static("public"));
server.listen(port);
