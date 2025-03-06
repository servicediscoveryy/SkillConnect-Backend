"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.ratingValidationSchema = exports.createServiceValidationSchema = exports.signupSchema = exports.signinSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const ApiError_1 = __importDefault(require("../utils/response/ApiError"));
const signinSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).max(30).required(),
});
exports.signinSchema = signinSchema;
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
const validateRequest = (schema, data) => {
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
        throw new ApiError_1.default(400, error.details[0].message, error.details.map((err) => err.message));
    }
};
exports.validateRequest = validateRequest;
const ratingValidationSchema = joi_1.default.object({
    _id: joi_1.default.string().required(),
    serviceId: joi_1.default.string().required(),
    rating: joi_1.default.number().min(1).max(5).required(),
    description: joi_1.default.string().max(500).optional(),
});
exports.ratingValidationSchema = ratingValidationSchema;
const createServiceValidationSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    category: joi_1.default.string().required(),
    image: joi_1.default.array().items(joi_1.default.string().uri()).required(), // Ensures image is an array of valid URLs
    price: joi_1.default.number().min(0).required(),
    tags: joi_1.default.array().items(joi_1.default.string()).optional(),
    location: joi_1.default.string().required(),
});
exports.createServiceValidationSchema = createServiceValidationSchema;
