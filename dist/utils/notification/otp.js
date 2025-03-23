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
exports.verifyOTP = exports.storeOTP = void 0;
const redisClient_1 = __importDefault(require("../../database/redisClient"));
// Function to generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const storeOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = generateOTP();
    yield redisClient_1.default.setEx(`otp:${email}`, 300, otp); // Store OTP with 5 min expiry
    return otp;
});
exports.storeOTP = storeOTP;
const verifyOTP = (email, userOTP) => __awaiter(void 0, void 0, void 0, function* () {
    const storedOTP = yield redisClient_1.default.get(`otp:${email}`);
    if (storedOTP && storedOTP === userOTP) {
        yield redisClient_1.default.del(`otp:${email}`); // Remove OTP after successful verification
        return true;
    }
    return false;
});
exports.verifyOTP = verifyOTP;
