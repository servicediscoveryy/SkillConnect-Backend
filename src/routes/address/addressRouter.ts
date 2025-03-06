import express from "express";
import { authuser } from "../../middleware/authMiddleware";
import {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from "../../controller/address/addressController";

const addressRouter = express.Router();

// Create a new address
addressRouter.post("/", authuser, createAddress);

// Get all addresses for the logged-in user
addressRouter.get("/", authuser, getAllAddresses);

// Get a specific address by ID
addressRouter.get("/:addressId", authuser, getAddressById);

// Update an address
addressRouter.put("/:addressId", authuser, updateAddress);

// Delete an address
addressRouter.delete("/:addressId", authuser, deleteAddress);

export default addressRouter;
