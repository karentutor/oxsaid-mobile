import { io } from "socket.io-client";

const APP_URL = "http://10.0.0.99:8000"; // Use your server's IP address
const socket = io(APP_URL, {
  path: "/socket.io/", // Default path
  reconnection: false,
});

socket.on("connect", () => {
  console.log("Socket connected", socket.id);
});

export default socket;
