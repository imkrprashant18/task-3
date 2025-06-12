import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { UploadOnCloudinary } from "../utils/cloudinary.ts";
import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { Blogs } from "../models/blog.models.ts";

interface AuthenticatedRequest extends Request {
        user?: {
                _id?: string;
                email: string;
                fullName: string;
                avatar: string;
                password: string;
                refreshToken?: string;
        };
        blog?: {
                title: string;
                featureImage: string;
                slug: string;
                content: string;
                isAuthor: boolean;
                createdAt: Date;
                updatedAt: Date;
        };
}
const createBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { title, content } = req.body;
        if ([title, content].some((field) => !field || field.trim() === "")) {
                throw new ApiError(400, "Title and content are required");
        }
        const slug =
                title
                        .toLowerCase()
                        .replace(/[^a-zA-Z0-9 ]/g, "")
                        .replace(/\s+/g, "-") + "-" + uuidv4();
        const existingBlog = await Blogs.findOne({ slug });
        if (existingBlog) {
                throw new ApiError(409, "A blog with a similar title already exists");
        }
        let localFilePath: string | undefined;
        if (req.files && !Array.isArray(req.files) && 'featureImage' in req.files) {
                const featureImageFiles = (req.files as { [fieldname: string]: Express.Multer.File[] }).featureImage;
                localFilePath = featureImageFiles && featureImageFiles[0]?.path;
        }
        if (!localFilePath) {
                throw new ApiError(400, "Feature image is required");
        }
        const uploadImage = await UploadOnCloudinary(localFilePath);
        if (!uploadImage) {
                throw new ApiError(500, "Failed to upload feature image");
        }
        if (!req.user || !req.user._id) {
                throw new ApiError(401, "User authentication required");
        }
        const blog = await Blogs.create({
                title,
                featureImage: uploadImage.url,
                slug,
                content,
                author: req.user._id,
                isAuthor: true,
        });

        const createdBlog = await Blogs.findById(blog._id).populate("author", "fullName email");

        if (!createdBlog) {
                throw new ApiError(500, "Blog creation failed");
        }
        res
                .status(201)
                .json(new ApiResponse(201, createdBlog, "Blog created successfully"));
});

// get all blogs
const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
        const blogs = await Blogs.find().populate("author", "fullName email");
        res.status(200).json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
});
// get blogs by id
const getBlogById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const blog = await Blogs.findById(id).populate("author", "fullName email");
        if (!blog) {
                throw new ApiError(404, "Blog not found");
        }
        res.status(200).json(new ApiResponse(200, blog, "Blog fetched successfully"));
});
// update blog  for only authors
const updateBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { blogId } = req.params;
        const { title, content } = req.body;
        const blog = await Blogs.findById(blogId);
        if (!blog) {
                throw new ApiError(404, "Blog not found");
        }

        if (
                !req.user ||
                !req.user._id ||
                req.user._id.toString() !== blog.author.toString() ||
                blog.isAuthor !== true
        ) {
                throw new ApiError(403, "You are not authorized to update this blog");
        }

        if (title) {
                blog.title = title;
                blog.slug =
                        title
                                .toLowerCase()
                                .replace(/[^a-zA-Z0-9 ]/g, "")
                                .replace(/\s+/g, "-") + "-" + (blog._id as string).toString();
        }

        if (content) {
                blog.content = content;
        }
        if (req.files && !Array.isArray(req.files) && 'featureImage' in req.files) {
                const featureImageFiles = (req.files as { [fieldname: string]: Express.Multer.File[] }).featureImage;
                const localFilePath = featureImageFiles && featureImageFiles[0]?.path;
                if (localFilePath) {
                        const uploadImage = await UploadOnCloudinary(localFilePath);
                        if (!uploadImage) {
                                throw new ApiError(500, "Failed to upload new feature image");
                        }
                        blog.featureImage = uploadImage.url;
                }
        }
        const updatedBlog = await blog.save();
        res.status(200).json(new ApiResponse(200, updatedBlog, "Blog updated successfully"));
})



// delete blogs
const deleteBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { blogId } = req.params;

        const blog = await Blogs.findById(blogId);

        if (!blog) {
                throw new ApiError(404, "Blog not found");
        }

        if (
                !req.user ||
                !req.user._id ||
                !blog.author ||
                req.user._id.toString() !== blog.author.toString() ||
                blog.isAuthor !== true
        ) {
                throw new ApiError(403, "You are not authorized to delete this blog");
        }

        await blog.deleteOne();

        res.status(200).json(new ApiResponse(200, null, "Blog deleted successfully"));
});

export {
        createBlog,
        getAllBlogs,
        getBlogById,
        updateBlog,
        deleteBlog
}
