"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authuser = void 0;
const userModel_1 = __importDefault(require("../models/userModel")); // Ensure you are importing the User model
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authuser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Get token from cookie or authorization header
        let token = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.token) || ((_b = req === null || req === void 0 ? void 0 : req.headers["authorization"]) === null || _b === void 0 ? void 0 : _b.split(" ")[1]);
        console.log(token);
        console.log(req.cookies);
        if (!token) {
            return res.status(401).json({ message: "Please Login" });
        }
        // Verify the token
        const decodedObj = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // If the token is invalid or cannot be decoded
        if (!decodedObj) {
            return res.status(401).json({ message: "Invalid token" });
        }
        // Extract userId from the decoded token
        // @ts-ignore
        const { userId } = decodedObj.user;
        // Find user by userId and exclude password field from the result
        const user = yield userModel_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Attach the user to the request object for further processing in the next middleware or route handler
        // @ts-ignore
        req.user = user;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: "ERROR: " + error.message });
    }
});
exports.authuser = authuser;
