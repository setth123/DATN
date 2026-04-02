import express from "express";
import * as messageController from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middeware.js";
import { uploadLocal } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, messageController.sendMessage); // No io passed
router.post("/file", authMiddleware, uploadLocal.single('file'), messageController.sendFile); // No io passed
router.get("/", authMiddleware, messageController.getMessages);

export default router; // Export directly