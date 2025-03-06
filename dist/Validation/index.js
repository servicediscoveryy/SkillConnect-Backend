"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// const signupSchema = z.object({
//   firstName: z
//     .string()
//     .nonempty("First name is required") // Custom required message
//     .min(2, "First name must be at least 2 characters")
//     .max(50),
//   lastName: z
//     .string()
//     .nonempty("Last name is required")
//     .min(2, "Last name must be at least 2 characters")
//     .max(50),
//   phone: z
//     .string()
//     .nonempty("Phone number is required")
//     .regex(/^[0-9]{10}$/, "Phone must be a valid 10-digit number"),
//   email: z
//     .string()
//     .nonempty("Email is required")
//     .email("Invalid email address"),
//   password: z
//     .string()
//     .nonempty("Password is required")
//     .min(6, "Password must be at least 6 characters")
//     .max(30),
// });
const signupSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(2).max(50).required(),
    lastName: joi_1.default.string().min(2).max(50).required(),
    phone: joi_1.default.string()
        .pattern(/^[0-9]{10}$/)
        .required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).max(30).required(),
});
exports.signupSchema = signupSchema;
