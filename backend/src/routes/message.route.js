import express from "express";
import * as messageController from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middeware.js";

const router=express.Router();

router.post("/",authMiddleware,messageController.sendMessage);
router.get("/",authMiddleware,messageController.getMessages);
export default router;