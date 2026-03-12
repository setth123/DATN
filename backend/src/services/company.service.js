import Company from "../models/Company.model.js";
import User from "../models/User.model.js";
import Job from "../models/Job.model.js";
import Application from "../models/Application.model.js";
import validateCompanyData from "../utils/companyValidation.js"
import { sendCompanyApprovalMail, sendCompanyRejectedMail } from "./mail.service.js"

export const getMyCompany = async (userId) => {
  return Company.findOne({ ownerId: userId });
};

export const createOrUpdateCompany = async (userId, data) => {
  const existing = await Company.findOne({ ownerId: userId });
  if (existing) {
    // Update existing company
    return await updateCompany(userId, data);
  }

  const validation = validateCompanyData(data);
  let status = "PENDING";

  if (validation.isValid) {
    status = "APPROVED";
  } else {
    status = "REJECTED";
  }

  const company = await Company.create({
    ownerId: userId,
    status,
    ...data
  });

  const user = await User.findById(userId);

  if (status === "APPROVED") {
    await User.findByIdAndUpdate(userId, {
      "roles.recruiter": true
    });

    await sendCompanyApprovalMail(user.email, company.name);
  } else {
    await sendCompanyRejectedMail(user.email, validation.errors);
  }

  return company;
};


export const updateCompany = async (userId, data) => {
  const company = await Company.findOne({ ownerId: userId });

  if (!company) {
    throw new Error("Company not found");
  }

  // Giữ bản sao dữ liệu cũ
  const oldData = company.toObject();

  // Dữ liệu giả lập sau khi update (để validate)
  const mergedData = {
    ...oldData,
    ...data
  };

  const validation = validateCompanyData(mergedData);

  // ❌ Validate thất bại → KHÔNG UPDATE
  if (!validation.isValid) {
    const user = await User.findById(userId);

    await sendCompanyRejectedMail(user.email, validation.errors);

    return {
      company: oldData,
      status: oldData.status,
      updated: false
    };
  }

  // ✅ Validate thành công → UPDATE THẬT
  company.set({
    ...data,
    status: "APPROVED"
  });

  await company.save();

  await User.findByIdAndUpdate(userId, {
    "roles.recruiter": true
  });

  const user = await User.findById(userId);

  await sendCompanyApprovalMail(user.email, company.name);

  return {
    company,
    status: "APPROVED",
    updated: true
  };
};

export const getApplicationsByJob = async (userId, jobId) => {
  const company = await Company.findOne({
    ownerId: userId,
    status: "approved"
  });

  if (!company) throw new Error("Company not found");

  const job = await Job.findOne({
    _id: jobId,
    companyId: company._id
  });

  if (!job) throw new Error("Job not found or access denied");

  const applications = await Application.find({ jobId })
    .populate({
      path: "candidateId",
      select: "fullName phone title skills cv"
    })
    .sort({ createdAt: -1 });

  return {
    job: {
      id: job._id,
      title: job.title
    },
    applications
  };
};