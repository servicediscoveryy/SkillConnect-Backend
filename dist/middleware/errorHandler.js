"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
    });
};
exports.default = errorHandler;
