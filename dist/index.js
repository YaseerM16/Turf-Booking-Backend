"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const SocketService_1 = require("./infrastructure/services/SocketService");
dotenv_1.default.config();
const port = process.env.PORT || 5000;
// app.use(cors({
//     origin: ['http://localhost:3001'], // Replace with your frontend origin
// }));
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["https://www.turfbooking.online", "https://api.turfbooking.online"], // Allow frontend
        methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
        credentials: true, // Allow credentials like cookies
    },
});
(0, SocketService_1.socketHandler)(io);
server.listen(port, () => {
    console.log("Server listening on port 5000");
});
