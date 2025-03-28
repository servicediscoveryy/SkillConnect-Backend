"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(statusCode, data, message = "Success", pagination) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = true;
        if (pagination) {
            this.pagination = pagination;
        }
    }
}
exports.default = ApiResponse;
