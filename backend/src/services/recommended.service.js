import Candidate from "../models/Candidate.model.js";
import Job from "../models/Job.model.js";
import Company from "../models/Company.model.js";
import { matchCandidateToJob } from "./matching.service.js";    

export const recommendJobs = async (userId) => {
  const candidate = await Candidate.findOne({ userId });
  const jobs = await Job.find();

  return jobs
  .map(job => {
    const match = matchCandidateToJob(job, candidate);
    return {
      job,
      matchScore: match.percentage,
      matchDetail: match.detail
    };
  })
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 10);

};
export const recommendCompany= async (userId) => {
  const candidate = await Candidate.findOne({ userId });
  // find suitable company based on ..
  }

export const recommendCandidatesForJob = async (userId, jobId) => {
  // 1. Check company
  const company = await Company.findOne({
    ownerId: userId,
    status: "approved"
  });

  if (!company) {
    throw new Error("Company not found or not approved");
  }

  // 2. Check job ownership
  const job = await Job.findOne({
    _id: jobId,
    companyId: company._id
  });

  if (!job) {
    throw new Error("Job not found or access denied");
  }

  // 3. Load candidates
  const candidates = await Candidate.find();

  // 4. Matching
  const results = candidates
    .map(candidate => {
      const match = matchCandidateToJob(job, candidate);
      return {
        candidate: {
          _id: candidate._id,
          fullName: candidate.fullName,
          title: candidate.title,
          skills: candidate.skills,
          cv: candidate.cv
        },
        matchScore: match.percentage,
        matchDetail: match.detail
      };
    })
    .filter(item => item.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    job: {
      _id: job._id,
      title: job.title
    },
    candidates: results
  };
};
