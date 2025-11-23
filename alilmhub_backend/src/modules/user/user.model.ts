import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { TBaseUser, UserRole, UserModal } from "./user.interface";
import { Auth } from "../auth/auth.model";

const userSchema = new Schema<TBaseUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Please provide a valid email",
      },
    },
    profileImage: {
      type: String,
      trim: true,
      default: null,
    },
    authId: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    reputation: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ authId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ reputation: 1 });
// keep Auth email in sync
userSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    const session = this.$session();
    const auth = await Auth.findById(this.authId).session(session);
    if (auth) {
      auth.email = this.email;
      await auth.save({ session });
    }
  }
  next();
});

// Statics
userSchema.statics.isExistUserById = async function (id: string) {
  return this.findById(id);
};

userSchema.statics.isExistUserByEmail = async function (email: string) {
  return this.findOne({ email });
};

userSchema.statics.isMatchPassword = function (
  password: string,
  hashPassword: string
) {
  return bcrypt.compareSync(password, hashPassword);
};

export const User = model<TBaseUser, UserModal>("User", userSchema, "users");
