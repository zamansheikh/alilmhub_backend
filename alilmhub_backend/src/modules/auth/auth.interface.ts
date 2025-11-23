import { Types } from "mongoose";

export enum LoginProvider {
  EMAIL = "email",
}

export type TCreateUser = {
  name: string;
  email: string;
  role: string;
  password: string;
  loginProvider: LoginProvider;
};

export type TAuth = {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  loginProvider: LoginProvider;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TVerifyEmail = {
  email: string;
  oneTimeCode: string;
  reason: "account_verification" | "password_reset";
};

export type TAuthResetPassword = {
  newPassword: string;
};
export type TChangePassword = {
  currentPassword: string;
  newPassword: string;
};

export type TLoginData = {
  email: string;
  password: string;
  loginProvider: LoginProvider;
  name?: string;
};
