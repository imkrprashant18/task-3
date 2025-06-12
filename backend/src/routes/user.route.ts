import { verifyJWT } from './../middelware/auth.middelware.ts';
import { Router } from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser, updateUser } from "../controllers/user.controller.ts"
import { upload } from "../middelware/multer.middelware.ts";
const router = Router()
// register route
router.post("/register", upload.single("avatar"), registerUser)
// login route
router.post("/login", loginUser)
// protected routes
router.get("/current-user", verifyJWT, getCurrentUser)
router.post("/logout", verifyJWT, logoutUser)
router.patch("/update", verifyJWT, upload.single("avatar"), updateUser)




export default router
