import Joi, { ObjectSchema } from "joi";
import ApiError from "../utils/response/ApiError";

const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
});

const signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
});

const validateRequest = (schema: ObjectSchema, data: any) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new ApiError(
      400,
      error.details[0].message,
      error.details.map((err) => err.message)
    );
  }
};

const ratingValidationSchema = Joi.object({
  _id: Joi.string().required(),
  serviceId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  description: Joi.string().max(500).optional(),
});

const createServiceValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  image: Joi.array().items(Joi.string().uri()).required(), // Ensures image is an array of valid URLs
  price: Joi.number().min(0).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  location: Joi.string().required(),
});

export {
  signinSchema,
  signupSchema,
  createServiceValidationSchema,
  ratingValidationSchema,
  validateRequest,
};
