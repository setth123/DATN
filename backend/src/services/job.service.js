import Job from "../models/Job.model.js";
import Company from "../models/Company.model.js";
import { buildJobQuery, buildSortQuery } from "./jobQuery.service.js";

export const createJob = async (userId, data) => {
  const company = await Company.findOne({
    ownerId: userId,
    status: "approved"
  });

  if (!company) {
    throw new Error("Approved company not found");
  }

  return Job.create({
    companyId: company._id,
    applicationsNum: 0,
    ...data
  });
};

export const getJobById = async (jobId) => {
  return Job.findById(jobId).populate("companyId", "name logo");
};

export const getJobs = async (query) => {
  const {
    page = 1,
    limit = 5,
    sort
  } = query;

  const filter = buildJobQuery(query);
  const sortQuery = buildSortQuery(sort);

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate("companyId", "name logo location")
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit)),
    Job.countDocuments(filter)
  ]);

  return {
    data: jobs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};
