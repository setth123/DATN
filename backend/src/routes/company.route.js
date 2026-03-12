import express from "express";
import * as companyController from "../controllers/company.controller.js";
import { authMiddleware } from "../middlewares/auth.middeware.js";
import { uploadLocal } from "../middlewares/upload.middleware.js";
import { requireRecruiter } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/me", companyController.getMyCompany);
router.post(
  "/",
  uploadLocal.single("logo"),
  companyController.createOrUpdateCompany
);
router.get(
  "/jobs/:jobId/applications",
  authMiddleware,
  requireRecruiter,
  companyController.getJobApplications
);
export default router;
