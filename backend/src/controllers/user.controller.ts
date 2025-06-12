import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { User } from "../models/user.models.ts";
import type { Request, Response } from "express";
import { UploadOnCloudinary } from "../utils/cloudinary.ts";
import type { Request as ExpressRequest } from "express";
interface AuthenticatedRequest extends ExpressRequest {
        user?: {
                _id?: string;
                email: string;
                fullName: string;
                avatar: string;
                password: string;
                refreshToken?: string;
        };
}
const generateAccessandRefereshToken = async (userId: string) => {
        try {
                const user = await User.findById(userId);
                if (!user) {
                        throw new ApiError(404, "User not found");
                }
                const accessToken = user.generateAccessToken();
                const refreshToken = user.generateRefreshToken();
                user.refreshToken = refreshToken;
                await user.save({ validateBeforeSave: false });
                return { accessToken, refreshToken };
        } catch (error) {
                throw new ApiError(
                        500,
                        "Something went wrong while generating refresh and access token"
                );
        }
};

// registeruser
const registerUser = asyncHandler(async (req: Request, res: Response) => {
        const { fullName, username, email, password } = req.body;
        if (
                [fullName, username, email, password].some(
                        (field) => !field || field.trim() === ""
                )
        ) {
                throw new ApiError(400, "All fields are required");
        }
        const existingUser = await User.findOne({
                $or: [{ email }, { username }],
        });

        if (existingUser) {
                throw new ApiError(409, "User with this email, phone, or username already exists");
        }
        if (!req.file?.path) {
                throw new ApiError(400, "Avatar file is required");
        }

        const avatar = await UploadOnCloudinary(req.file.path);
        if (!avatar) {
                throw new ApiError(500, "Failed to upload avatar");
        }
        const user = await User.create({
                fullName,
                username,
                email,
                password,
                avatar: avatar.url,
        });

        const createdUser = await User.findById(String(user._id)).select("-password");
        if (!createdUser) {
                throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res
                .status(201)
                .json(new ApiResponse(201, createdUser.toObject(), "User registered successfully"));
});

// loginuser
const loginUser = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if (!email || !password) {
                throw new ApiError(400, "Email and password are required");
        }
        const user = await User.findOne({ email });
        if (!user) {
                throw new ApiError(404, "User does not exist");
        }
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
                throw new ApiError(401, "Invalid user credentials");
        }
        const { accessToken, refreshToken } = await generateAccessandRefereshToken(String(user._id));
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict" as const,
                maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        return res
                .status(200)
                .cookie("accessToken", accessToken, cookieOptions)
                .cookie("refreshToken", refreshToken, cookieOptions)
                .json(
                        new ApiResponse(
                                200,
                                {
                                        user: loggedInUser,
                                        accessToken,
                                        refreshToken,
                                },
                                "User logged in successfully"
                        )
                );
});
//get current user
const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        return res
                .status(200)
                .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});
// logout user
const logoutUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        await User.findByIdAndUpdate(
                req.user?._id,
                {
                        $unset: {
                                refreshToken: 1,
                        },
                },
                {
                        new: true,
                }
        );
        const options = {
                httpOnly: true,
                secure: true,
        };
        return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(new ApiResponse(200, {}, "Admin logged Out"));
});
// update  user
const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { fullName, username, email } = req.body;

        if ([fullName, username, email].some((field) => !field || field.trim() === "")) {
                throw new ApiError(400, "All fields are required");
        }

        if (!req.user?._id) {
                throw new ApiError(401, "Unauthorized: User not authenticated");
        }

        // Check for existing user with the same email or username (excluding current user)
        const existingUser = await User.findOne({
                $or: [{ email }, { username }],
                _id: { $ne: req.user._id }, // Exclude current user
        });

        if (existingUser) {
                throw new ApiError(409, "Email or username already in use by another user");
        }

        // Upload new avatar if provided
        let avatarUrl;
        if (req.file?.path) {
                const avatar = await UploadOnCloudinary(req.file.path);
                if (!avatar) {
                        throw new ApiError(500, "Failed to upload avatar");
                }
                avatarUrl = avatar.url;
        }

        // Update user fields
        const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                {
                        fullName,
                        username,
                        email,
                        ...(avatarUrl && { avatar: avatarUrl }), // Only update avatar if provided
                },
                {
                        new: true,
                        runValidators: true,
                }
        ).select("-password -refreshToken");

        if (!updatedUser) {
                throw new ApiError(500, "Failed to update user profile");
        }

        return res
                .status(200)
                .json(new ApiResponse(200, updatedUser.toObject(), "User profile updated successfully"));
});

export { registerUser, loginUser, getCurrentUser, logoutUser, updateUser };
