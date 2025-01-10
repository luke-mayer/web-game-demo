const port = 3000;

const socket = io(`ws://localhost:${port}`);

socket.on("connect", () => {
  console.log("connected: front-end");
});
