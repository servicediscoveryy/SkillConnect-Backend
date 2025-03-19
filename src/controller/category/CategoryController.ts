import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/response/ApiError";
import ApiResponse from "../../utils/response/ApiResponse";
import Category from "../../models/categoryModel";
import STATUS from "../../data/statusCodes";

// Create a new category
export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { category } = req.body;

    if (!category) {
      throw new ApiError(STATUS.badRequest, "Category name is required");
    }

    const existingCategory = await Category.findOne({ category });
    if (existingCategory) {
      throw new ApiError(STATUS.conflict, "Category already exists");
    }

    const newCategory = new Category({ category: category });
    const savedCategory = await newCategory.save();

    res
      .status(201)
      .json(
        new ApiResponse(201, savedCategory, "Category created successfully")
      );
  }
);

// Get all categories
export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await Category.find();
    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(
          STATUS.ok,
          categories,
          "Categories fetched successfully"
        )
      );
  }
);

// Get a single category by ID
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      throw new ApiError(STATUS.notFound, "Category not found");
    }

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(STATUS.ok, category, "Category fetched successfully")
      );
  }
);

// Update a category
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { category } = req.body;

    if (!category) {
      throw new ApiError(STATUS.badRequest, "Category name is required");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { category },
      { new: true }
    );

    if (!updatedCategory) {
      throw new ApiError(STATUS.notFound, "Category not found");
    }

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(
          STATUS.ok,
          updatedCategory,
          "Category updated successfully"
        )
      );
  }
);

// Delete a category
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const deletedCategory = await Category.findByIdAndDelete(
      req.params.categoryId
    );

    if (!deletedCategory) {
      throw new ApiError(STATUS.notFound, "Category not found");
    }

    res
      .status(STATUS.ok)
      .json(new ApiResponse(STATUS.ok, {}, "Category deleted successfully"));
  }
);
