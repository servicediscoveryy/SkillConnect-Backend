import express from "express"
import userRouter from "./routes/auth/userRoutes";
import dotenv from "dotenv";
import cors from "cors"
import cookieparser from "cookie-parser";
import { dbconnect } from "./config/db";
import profileRouter from "./routes/profile/profileRoute";
import serviceRouter from "./routes/service/serviceRoutes";
dotenv.config();
const app = express();

app.use(cookieparser());
app.use(express.json())
app.use(cors({
    origin: "*",
    credentials: true
}));

// authentication routes
app.use("/", userRouter)

// user profile routes
app.use("/api", profileRouter)

// service routes
app.use("/api/service", serviceRouter)




app.get("/", (req, res) => {
    res.send("SERVER IS WORKING")
})


// dbconfig
const PORT = process.env.PORT || 3000;
dbconnect().then(() => {
    console.log("db connected")
    app.listen(PORT, () => {
        console.log("server is running on port " + PORT);
    })
}).catch((err) => {
    console.log(err.message)
})