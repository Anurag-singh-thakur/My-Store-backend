import express from "express";
import { SigninController,signController,logoutController,updateController,getuserProfile } from "../controller/UserController.js";
import {protectRoute} from "../middleware/protectRoute.js"
const router = express.Router();

router.get('/profile/:query',protectRoute,getuserProfile);
router.post('/Signin',SigninController);
router.post('/signup',signController);
router.post('/logout',logoutController);
router.put('/:id',protectRoute,updateController);
// router.post('/post/:id',protectRoute,checkController);

export default router