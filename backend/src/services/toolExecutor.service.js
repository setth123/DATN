import * as jobService from "./job.service.js";
import * as recommendedService from "./recommended.service.js";
import * as candidateService from "./candidate.service.js";
import { LEVEL_MAP } from "./matching.service.js"; // Import LEVEL_MAP để đảm bảo tính nhất quán

// Định nghĩa ánh xạ từ tên tool sang các hàm dịch vụ tương ứng
const toolFunctionMap = {
  searchJobs: async ({ keyword, skill, level }) => {
    const query = {};
    if (keyword) query.keyword = keyword;
    if (skill) query.skills = skill; // buildJobQuery trong job.query.service.js mong đợi 'skills' (số nhiều)
    if (level) query.level = level;

    const result = await jobService.getJobs(query);
    // Trả về dữ liệu job đã được đơn giản hóa cho AI
    return result.data.map(job => ({
      _id: job._id,
      title: job.title,
      company: job.companyId?.name, // Sử dụng optional chaining vì companyId có thể chưa được populate đầy đủ
      level: job.level, 
      requiredSkills: job.requiredSkills
    }));
  },

  recommendJobsForCandidate: async ({ candidateId }) => {
    // Giả định candidateId từ tool schema là userId của ứng viên
    const result = await recommendedService.recommendJobs(candidateId);
    return result.map(item => ({
      _id: item.job._id,
      title: item.job.title,
      company: item.job.companyId?.name, // Sử dụng optional chaining
      matchScore: item.matchScore
    }));
  },

  recommendCandidatesForJob: async ({ jobId }, userId) => {
    // Hàm này yêu cầu userId của nhà tuyển dụng để kiểm tra quyền sở hữu công ty
    if (!userId) {
      throw new Error("User ID (recruiter) is required for recommendCandidatesForJob.");
    }
    const result = await recommendedService.recommendCandidatesForJob(userId, jobId);
    return {
      job: {
        _id: result.job._id,
        title: result.job.title
      },
      candidates: result.candidates.map(candidate => ({
        _id: candidate.candidate._id,
        fullName: candidate.candidate.fullName,
        title: candidate.candidate.title,
        matchScore: candidate.matchScore
      }))
    };
  },

  analyzeCandidateGapForJob: async ({ candidateId, jobId }) => {
    // Giả định candidateId từ tool schema là userId của ứng viên
    const job = await jobService.getJobById(jobId);
    const candidate = await candidateService.getMyCandidateProfile(candidateId); // Giả định candidateId là userId

    if (!job || !candidate) {
      return { error: "Không tìm thấy Job hoặc Candidate để phân tích khoảng cách." };
    }

    const missingSkills = job.requiredSkills.filter(
      skill => !candidate.skills?.includes(skill) // Sử dụng optional chaining
    );

    let levelGap = 0;
    const candidateLevel = LEVEL_MAP[candidate.level?.toLowerCase()] || 0;
    const jobLevel = LEVEL_MAP[job.level?.toLowerCase()] || 0;

    if (candidateLevel < jobLevel) {
      levelGap = jobLevel - candidateLevel;
    }

    return {
      jobTitle: job.title,
      candidateName: candidate.fullName,
      missingSkills: missingSkills.length > 0 ? missingSkills : "Không thiếu kỹ năng nào.",
      levelGap: levelGap > 0 ? `Cấp độ của ứng viên thấp hơn ${levelGap} cấp so với yêu cầu của công việc.` : "Cấp độ của ứng viên đáp ứng hoặc vượt quá yêu cầu công việc."
    };
  }
};

export const executeTool = async (toolName, args, userId) => {
  const func = toolFunctionMap[toolName];
  if (!func) {
    throw new Error(`Không tìm thấy hàm tool '${toolName}'.`);
  }
  // Truyền userId cho hàm tool nếu nó cần
  return await func(args, userId);
};
