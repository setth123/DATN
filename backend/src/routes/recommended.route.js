import express from "express";
import { authMiddleware } from "../middlewares/auth.middeware.js";
import { requireRecruiter,requireCandidate } from "../middlewares/role.middleware.js";
import * as recommendController from "../controllers/recommended.controller.js";

const router = express.Router();

router.get(
  "/candidates/:jobId",
  authMiddleware,
  requireRecruiter,
  recommendController.recommendCandidates
);
router.get(
    "/jobs/",
    authMiddleware,
    requireCandidate,
    recommendController.recommendJobs
)
export default router;
