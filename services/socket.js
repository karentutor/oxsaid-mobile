import { io } from "socket.io-client";

const APP_URL = "http://10.0.0.99:8000"; // Replace with your server's IP and port
//const APP_URL = "https://api.oxsaid.net"; // Replace with your server's IP and port

const socket = io(APP_URL, {
  path: "/socket.io/", // Default path
  reconnection: false,
  autoConnect: false, // Prevent automatic connection on initialization
});

// Function to connect the socket
export const connectSocket = () => {
  socket.connect();
};

// Export the socket instance for use in other components
export default socket;
