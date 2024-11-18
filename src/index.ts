import dotenv from "dotenv";
import app from "./app";
import cors from "cors"

dotenv.config()

const port = process.env.PORT || 5000

// app.use(cors({
//     origin: ['http://localhost:3001'], // Replace with your frontend origin
// }));




app.listen(port, () => console.log("Server is running @ the Port:", port))

app