import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define the User interface
interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: "user" | "admin" | "provider";
  profilePicture?: string;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      set: (value: string) => value.toLowerCase(),
    },
    lastName: {
      type: String,
      required: true,
      set: (value: string) => value.toLowerCase(),
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      set: (value: string) => value.toLowerCase(),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: (value: string) => value.toLowerCase(),
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "provider"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
  },
  { timestamps: true }
);

// Hash password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Create User model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
