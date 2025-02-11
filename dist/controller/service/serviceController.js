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
exports.getAllServices = exports.deleteService = exports.updateService = exports.getServiceById = exports.createService = void 0;
const serviceModel_1 = __importDefault(require("../../models/serviceModel"));
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const providerId = req.user._id;
        const { title, description, category, image, price, tags } = req.body;
        ;
        // validate body
        const newService = new serviceModel_1.default({
            providerId,
            title,
            description,
            category,
            image,
            price,
            status: 'active', // Service is active by default
            tags
        });
        const savedService = yield newService.save();
        res.status(201).json({
            message: "Service created successfully",
            data: savedService,
            success: true,
            error: false
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});
exports.createService = createService;
const getServiceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serviceId = req.params.serviceId;
        const service = yield serviceModel_1.default.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json({ data: service, success: true, error: false, message: "Service fetched successfully" });
    }
    catch (error) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
});
exports.getServiceById = getServiceById;
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // validate request body
        const { title, description, category, image, price, tags } = req.body;
        const updatedService = yield serviceModel_1.default.findByIdAndUpdate(req.params.serviceId, { title, description, category, image, price, tags }, { new: true } // Return the updated document
        );
        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json({ message: "Service updated successfully", data: updatedService, success: true, error: false });
    }
    catch (error) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
});
exports.updateService = updateService;
const deleteService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serviceId = req.params.serviceId;
        const service = yield serviceModel_1.default.findByIdAndDelete(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json({ message: "Service deleted successfully", success: true, error: false });
    }
    catch (error) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
});
exports.deleteService = deleteService;
const getAllServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield serviceModel_1.default.find();
        res.status(200).json({ data: services, success: true, error: false, message: "Services fetched successfully" });
    }
    catch (error) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
});
exports.getAllServices = getAllServices;
