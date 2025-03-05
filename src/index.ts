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
        origin: ['http://localhost:3000', "http://127.0.0.1:3000", "https://turf-booking-frontend.vercel.app", "https://www.turfbooking.online"], // Allow frontend
        methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
        credentials: true, // Allow credentials like cookies
    },
});

socketHandler(io);

server.listen(port, () => {
    console.log("Server listening on port 5000");
});


