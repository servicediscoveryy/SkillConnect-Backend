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
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../utils/response/ApiError")); // Import custom response functions
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.authuser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) || ((_b = req.headers["authorization"]) === null || _b === void 0 ? void 0 : _b.split(" ")[1]);
    if (!token) {
        throw new ApiError_1.default(401, "Please Login"); // Throw a custom error
    }
    // Verify the token
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    // Find user by userId
    const user = yield userModel_1.default.findById(decoded.userId);
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    req.user = user;
    next();
}));
