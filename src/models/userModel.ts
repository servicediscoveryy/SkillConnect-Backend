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
      set: (value: string) => value.toLowerCase(),
    },
    lastName: {
      type: String,
      set: (value: string) => value.toLowerCase(),
    },

    phone: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: (value: string) => value.toLowerCase(),
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

const User = mongoose.model<IUser>("User", userSchema);
export default User;
