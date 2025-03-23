"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const addressController_1 = require("../../controller/address/addressController");
const addressRouter = express_1.default.Router();
// Create a new address
addressRouter.post("/", authMiddleware_1.authuser, addressController_1.createAddress);
// Get all addresses for the logged-in user
addressRouter.get("/", authMiddleware_1.authuser, addressController_1.getAllAddresses);
// Get a specific address by ID
addressRouter.get("/:addressId", authMiddleware_1.authuser, addressController_1.getAddressById);
// Update an address
addressRouter.put("/:addressId", authMiddleware_1.authuser, addressController_1.updateAddress);
// Delete an address
addressRouter.delete("/:addressId", authMiddleware_1.authuser, addressController_1.deleteAddress);
exports.default = addressRouter;
