import Job from "../models/Job.model.js";
import Company from "../models/Company.model.js";
import { buildJobQuery, buildSortQuery } from "./jobQuery.service.js";

export const createOrUpdateJob = async (userId, data) => {
  const company = await Company.findOne({
    ownerId: userId,
    status: "APPROVED"
  });

  if (!company) {
    throw new Error("Approved company not found");
  }
  const existing = await Job.findOne({
    companyId: company._id,
    _id: data._id
  });
  if (existing) {
    return Job.findOneAndUpdate({
      companyId: company._id,
      _id: data._id
    }, data, {
      new: true
    });
  }
  return Job.create({
    companyId: company._id,
    applicationsNum: 0,
    ...data
  });
};
export const deleteJob=async(jobId,userId)=>{
  const job=await Job.findById(jobId);
  if(!job){
    throw new Error("Job not found");
  }
  await Job.findByIdAndDelete(jobId);
} 
export const getJobById = async (jobId) => {
  jobId = typeof jobId === "string" ? Job.schema.path("_id").cast(jobId) : jobId;
  return Job.findById(jobId).populate("companyId", "name logo");
};

export const getJobs = async (query) => {
  const {
    page = 1,
    limit = 12,
    sort= "newest"
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
export const getJobsByCompany = async (companyId) => {
    return Job.find({ companyId }).populate("companyId", "name logo location");
};