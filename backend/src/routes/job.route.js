import express from "express";
import * as jobController from "../controllers/job.controller.js";
import { authMiddleware } from "../middlewares/auth.middeware.js";
import { requireRecruiter } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/:id", jobController.getJobById);
router.get("/company/:companyId", jobController.getJobsByCompany);
router.post("/", authMiddleware, requireRecruiter, jobController.createJob);
router.get("/", jobController.getJobs);

export default router;
