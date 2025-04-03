"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./database/db");
const ApiError_1 = __importDefault(require("./utils/response/ApiError"));
const statusCodes_1 = __importDefault(require("./data/statusCodes"));
const userRoutes_1 = __importDefault(require("./routes/auth/userRoutes"));
const serviceProviderRoutes_1 = __importDefault(require("./routes/serviceProvider/serviceProviderRoutes"));
const serviceRouter_1 = __importDefault(require("./routes/services/serviceRouter"));
const bookingRouter_1 = __importDefault(require("./routes/booking/bookingRouter"));
const addressRouter_1 = __importDefault(require("./routes/address/addressRouter"));
const cartRouter_1 = __importDefault(require("./routes/cart/cartRouter"));
const categoryRouter_1 = __importDefault(require("./routes/category/categoryRouter"));
const admin_1 = require("./routes/admin");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
// authentication routes
app.use("/api/v1/auth", userRoutes_1.default);
//service routes
app.use("/api/v1/services", serviceRouter_1.default);
// service-Provider routes
app.use("/api/v1/provider-services", serviceProviderRoutes_1.default);
// booking routes
app.use("/api/v1/booking", bookingRouter_1.default);
//address routes
app.use("/api/v1/address", addressRouter_1.default);
//cart routes
app.use("/api/v1/cart", cartRouter_1.default);
// category Route
app.use("/api/v1/category", categoryRouter_1.default);
// admin routes
app.use("/api/v1/admin", admin_1.adminRouter);
app.get("/", (req, res) => {
    res.send("SERVER IS WORKING");
});
// Error handling middleware
app.use(
// @ts-ignore
(err, req, res, next) => {
    console.log(err);
    if (err instanceof ApiError_1.default) {
        return res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
            errors: err.errors,
            success: false,
        });
    }
    // Default error handling if it's not an instance of ApiError
    return res.status(statusCodes_1.default.internalServerError).json({
        status: err.statusCode,
        message: "Something went wrong. Please try again later.",
    });
});
// dbconfig
const PORT = process.env.PORT || 3000;
(0, db_1.dbconnect)()
    .then(() => {
    console.log("db connected");
    app.listen(PORT, () => {
        console.log("server is running on port " + PORT);
    });
})
    .catch((err) => {
    console.log(err.message);
});
