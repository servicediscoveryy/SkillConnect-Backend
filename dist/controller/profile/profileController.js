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
exports.getProfileController = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const getProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const user = req.user._id;
        const profile = yield userModel_1.default.findOne({ _id: user }).select("-password");
        if (profile) {
            // @ts-ignore
            res.status(200).json({
                message: "Profile fetched successfully",
                data: profile,
                success: true,
                error: false
            });
        }
    }
    catch (error) {
        // @ts-ignore
        res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});
exports.getProfileController = getProfileController;
