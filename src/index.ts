import dotenv from "dotenv";
import app from "./app";
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./infrastructure/services/SocketService"


dotenv.config()

const port = process.env.PORT || 5000

// app.use(cors({
//     origin: ['http://localhost:3001'], // Replace with your frontend origin
// }));


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // origin: "http://localhost:3000",
        origin: "https://www.turfbooking.online",
        methods: ["GET", "POST", 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Role'],
        credentials: true
    }
});

// const io = new Server(server, {
//     cors: {
//         origin: ["https://www.turfbooking.online", "https://api.turfbooking.online", "http://localhost:5000"], // Allow frontend
//         methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
//         credentials: true, // Allow credentials like cookies
//     },
// });

socketHandler(io);

server.listen(port, () => {
    console.log("Server listening on port 5000");
});


