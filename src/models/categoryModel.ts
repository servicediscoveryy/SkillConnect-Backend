import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      set: (value: string) => value.toLowerCase(),
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;
