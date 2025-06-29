import { io } from "socket.io-client";
const socket = io("https://polling-backend-knyo.onrender.com");
export default socket;
