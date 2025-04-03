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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/response/ApiError"));
const ApiResponse_1 = __importDefault(require("../../utils/response/ApiResponse"));
const categoryModel_1 = __importDefault(require("../../models/categoryModel"));
const statusCodes_1 = __importDefault(require("../../data/statusCodes"));
// Create a new category
exports.createCategory = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, image } = req.body;
    if (!category || !image) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Category name & Image is required");
    }
    const existingCategory = yield categoryModel_1.default.findOne({ category });
    if (existingCategory) {
        throw new ApiError_1.default(statusCodes_1.default.conflict, "Category already exists");
    }
    const newCategory = new categoryModel_1.default({ category: category, image: image });
    const savedCategory = yield newCategory.save();
    res
        .status(201)
        .json(new ApiResponse_1.default(201, savedCategory, "Category created successfully"));
}));
// Get all categories
exports.getCategories = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield categoryModel_1.default.find();
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, categories, "Categories fetched successfully"));
}));
// Get a single category by ID
exports.getCategoryById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield categoryModel_1.default.findById(req.params.categoryId);
    if (!category) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Category not found");
    }
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, category, "Category fetched successfully"));
}));
// Update a category
exports.updateCategory = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.body;
    if (!category) {
        throw new ApiError_1.default(statusCodes_1.default.badRequest, "Category name is required");
    }
    const updatedCategory = yield categoryModel_1.default.findByIdAndUpdate(req.params.categoryId, { category }, { new: true });
    if (!updatedCategory) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Category not found");
    }
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, updatedCategory, "Category updated successfully"));
}));
// Delete a category
exports.deleteCategory = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedCategory = yield categoryModel_1.default.findByIdAndDelete(req.params.categoryId);
    if (!deletedCategory) {
        throw new ApiError_1.default(statusCodes_1.default.notFound, "Category not found");
    }
    res
        .status(statusCodes_1.default.ok)
        .json(new ApiResponse_1.default(statusCodes_1.default.ok, {}, "Category deleted successfully"));
}));
