import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Secret } from "jsonwebtoken";
import config from "../../config";

import { jwtHelper } from "../util/jwtHelper";
import AppError from "../../errors/AppError";
import { User } from "../../modules/user/user.model";

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      console.log(tokenWithBearer);
      if (!tokenWithBearer) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      if (tokenWithBearer)
        if (tokenWithBearer && tokenWithBearer.startsWith("Bearer")) {
          const token = tokenWithBearer.split(" ")[1];
          //verify token
          const verifyUser = jwtHelper.verifyToken(
            token,
            config.jwt.jwt_secret as Secret
          );
          const requestedUser = await User.findById(verifyUser.id);
          if (!requestedUser) {
            throw new AppError(
              StatusCodes.UNAUTHORIZED,
              "You are not authorized"
            );
          }
          //set user to header
          req.user = requestedUser;
          //guard user
          if (roles.length && !roles.includes(requestedUser.role)) {
            throw new AppError(
              StatusCodes.FORBIDDEN,
              "You don't have permission to access this api"
            );
          }
          console.log("passed");
          next();
        }
    } catch (error) {
      next(error);
    }
  };

export default auth;
