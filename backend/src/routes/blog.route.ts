import { verifyJWT } from './../middelware/auth.middelware.ts';
import { Router } from "express";
import { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } from "../controllers/blog.controller.ts"
import { upload } from '../middelware/multer.middelware.ts';
const router = Router()
router.post("/create-blog", verifyJWT, upload.fields([
        {
                name: "featureImage",
                maxCount: 1
        },
]), createBlog)
// public
router.get("/get-all-blogs", getAllBlogs)
router.get("/get-blog/:id", getBlogById)
// private
router.get("/get-my-blogs", verifyJWT, getAllBlogs)
router.get("/get-my-blog/:id", verifyJWT, getBlogById)
// update blogs
router.patch("/update-blog/:blogId", verifyJWT, upload.fields([
        {
                name: "featureImage",
                maxCount: 1
        },
]), updateBlog)
// delete blogs
router.delete("/delete-blog/:blogId", verifyJWT, deleteBlog)



export default router