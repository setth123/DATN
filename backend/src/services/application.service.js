import Application from "../models/Application.model.js";
import Candidate from "../models/Candidate.model.js";
import Job from "../models/Job.model.js";

export const applyJob = async (userId, jobId, cvSnapshotUrl) => {
  const candidate = await Candidate.findOne({ userId });
  if (!candidate) throw new Error("Candidate profile not found");

  const existing = await Application.findOne({
    jobId,
    candidateId: candidate._id
  });

  if (existing) {
    throw new Error("Already applied to this job");
  }

  const application = await Application.create({
    jobId,
    candidateId: candidate._id,
    cvSnapshotUrl
  });

  await Job.findByIdAndUpdate(jobId, {
    $inc: { applicationsNum: 1 }
  });

  return application;
};

export const cancelApply = async (userId, jobId) => {
  const candidate = await Candidate.findOne({ userId });
  if (!candidate) throw new Error("Candidate profile not found");

  const deleted = await Application.findOneAndDelete({
    jobId,
    candidateId: candidate._id
  });

  if (!deleted) {
    throw new Error("Application not found");
  }

  await Job.findByIdAndUpdate(jobId, {
    $inc: { applicationsNum: -1 }
  });

  return true;
};

export const getMyApplications = async (userId, query) => {
  const candidate = await Candidate.findOne({ userId });
  if (!candidate) throw new Error("Candidate profile not found");

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    Application.find({ candidateId: candidate._id })
      .populate({
        path: "jobId",
        select: "title level companyId",
        populate: {
          path: "companyId",
          select: "name logo"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments({ candidateId: candidate._id })
  ]);

  return {
    data: applications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

