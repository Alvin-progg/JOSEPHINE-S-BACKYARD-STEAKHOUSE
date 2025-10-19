const token = localStorage.getItem("token"); // from login response
const socket = new WebSocket(`ws://localhost:8000/notify?token=${token}`);

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "notification") {
    alert(msg.data);
  }
};
