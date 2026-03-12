import * as companyService from "../services/company.service.js";
import { deleteFile } from "../services/file.service.js";

export const getMyCompany = async (req, res) => {
  try {
    const company = await companyService.getMyCompany(req.user.userId);
    res.json({ data: company });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createOrUpdateCompany = async (req, res) => {
  try {
    const companyData = { ...req.body };
    if (req.file) {
      companyData.logoURL = req.file.path;
    }
    if (req.body.deleteLogo === "true") {
      if (req.body.logoUrlToDelete) {
        await deleteFile(req.body.logoUrlToDelete);
      }
      companyData.logoURL = "";
    }
    const company = await companyService.createOrUpdateCompany(
      req.user.userId,
      companyData
    );

    res.status(201).json({
      message: "Company information updated",
      data: company,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const result = await companyService.getApplicationsByJob(
      req.user.userId,
      req.params.jobId
    );
    res.json(result);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};
