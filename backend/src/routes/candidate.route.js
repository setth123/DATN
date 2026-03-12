import express from "express";
import * as candidateController from "../controllers/candidate.controller.js";
import { authMiddleware } from "../middlewares/auth.middeware.js";
import { uploadLocal } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/me", candidateController.getMyProfile);
router.post("/", uploadLocal.single("cv"), candidateController.createOrUpdateProfile);


export default router;
