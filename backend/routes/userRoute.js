import express from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    getUsersList,
    getCurrentUser
} from "../controllers/userController.js"
import { isAuthenticated, authorizeRoles } from "../middleware/isAuthenticated.js"



const router = express.Router()

// router.post('/register',isAuthenticated, authorizeRoles("admin"),  registerUser)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout',isAuthenticated, logoutUser)
router.get("/", getUsersList);
router.get("/get-current-user", isAuthenticated, getCurrentUser);


export default router