import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define the User interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: "user" | "admin" | "provider";
  profilePicture?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the schema
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
      sparse: true, // allows multiple nulls
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

// Middleware to hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
