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
exports.deleteAddress = exports.updateAddress = exports.getAddressById = exports.getAllAddresses = exports.createAddress = void 0;
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
const addressModel_1 = __importDefault(require("../../models/addressModel"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const validation_1 = require("../../validation");
exports.createAddress = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.user._id;
    const { street, area, city, state, country, pincode, landmark } = req.body;
    (0, validation_1.validateRequest)(validation_1.addressValidationSchema, req.body);
    const address = new addressModel_1.default({
        userId: _id,
        street,
        area,
        city,
        state,
        country,
        pincode,
        landmark,
    });
    yield address.save();
    res
        .status(statusCodes_1.default.created)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, address, "saved address succssfully"));
}));
exports.getAllAddresses = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const addresses = yield addressModel_1.default.find({ userId });
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, addresses, "Fetched addresses successfully"));
}));
exports.getAddressById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { addressId } = req.params;
    const userId = req.user._id;
    const address = yield addressModel_1.default.findOne({ _id: addressId, userId });
    if (!address) {
        res
            .status(statusCodes_1.default.notFound)
            .json(new ApiResponse_1.default(statusCodes_1.default.notFound, null, "Address not found"));
        return;
    }
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, address, "Fetched address successfully"));
}));
exports.updateAddress = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { addressId } = req.params;
    const userId = req.user._id;
    const updatedAddress = yield addressModel_1.default.findOneAndUpdate({ _id: addressId, userId }, req.body, { new: true, runValidators: true });
    if (!updatedAddress) {
        res
            .status(statusCodes_1.default.notFound)
            .json(new ApiResponse_1.default(statusCodes_1.default.notFound, null, "Address not found"));
        return;
    }
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, updatedAddress, "Address updated successfully"));
}));
exports.deleteAddress = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { addressId } = req.params;
    const userId = req.user._id;
    const address = yield addressModel_1.default.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
        res
            .status(statusCodes_1.default.notFound)
            .json(new ApiResponse_1.default(statusCodes_1.default.notFound, null, "Address not found"));
        return;
    }
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, null, "Address deleted successfully"));
}));
