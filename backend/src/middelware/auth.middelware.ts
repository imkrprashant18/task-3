import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.models.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiError } from "../utils/apiError.ts";
import type { Request, Response, NextFunction } from "express";
declare module "express-serve-static-core" {
        interface Request {
                user?: {
                        email: string;
                        fullName: string;
                        avatar: string;
                        password: string;
                        refreshToken?: string;
                }
        }
}

export const verifyJWT = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
                try {
                        const token =
                                req.cookies?.accessToken ||
                                req.header("Authorization")?.replace("Bearer ", "");

                        if (!token) {
                                throw new ApiError(401, "Unauthorized request");
                        }
                        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload | string;
                        let user = null;
                        if (
                                typeof decodedToken === "object" &&
                                decodedToken !== null &&
                                (decodedToken as any).id
                        ) {
                                user = await User.findById((decodedToken as any).id).select(
                                        "-password -refreshToken"
                                );
                        }

                        if (!user) {
                                throw new ApiError(401, "Invalid Access Token");
                        }
                        req.user = user;
                        next();
                } catch (error: any) {
                        throw new ApiError(
                                401,
                                error?.message || "Invalid access token. Please try again with a valid token."
                        );
                }
        }
);
