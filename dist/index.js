"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/auth/userRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const profileRoute_1 = __importDefault(require("./routes/profile/profileRoute"));
const serviceRoutes_1 = __importDefault(require("./routes/service/serviceRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true
}));
// authentication routes
app.use("/", userRoutes_1.default);
// user profile routes
app.use("/api", profileRoute_1.default);
// service routes
app.use("/api/service", serviceRoutes_1.default);
app.get("/", (req, res) => {
    res.send("SERVER IS WORKING");
});
// dbconfig
const PORT = process.env.PORT || 3000;
(0, db_1.dbconnect)().then(() => {
    console.log("db connected");
    app.listen(PORT, () => {
        console.log("server is running on port " + PORT);
    });
}).catch((err) => {
    console.log(err.message);
});
