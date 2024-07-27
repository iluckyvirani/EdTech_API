import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      unique: true,
    },
    isUserVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    otpCreatedAt: {
      type: Date,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    category: {
      type: String,
      enum: ["General", "OBC", "SC", "ST", "PWD-VI"], 
    },
    education: {
      type: String,
      enum: ["10th pass", "12th pass", "University", "Other"], 
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
