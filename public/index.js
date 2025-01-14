const port = 3000;

const socket = io(`ws://localhost:${port}`);

const inputs = {
  click: false,
};

socket.on("connect", () => {
  console.log("connected: front-end");
});

window.addEventListener("keydown", (e) => {
  console.log(e.key);
  if (e.key === "d") {
    inputs["click"] = true;
  }
  socket.emit("inputs", inputs);
});

window.addEventListener("keyup", (e) => {
  if (e.key === "d") {
    inputs["click"] = false;
  }
  socket.emit("inputs", inputs);
});
