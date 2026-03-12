export const tools = [
  {
    functionDeclarations: [

      // 1. searchJobs
      {
        name: "searchJobs",
        description:
          "Tìm kiếm job khi người dùng CHỦ ĐỘNG nhập tiêu chí cụ thể như từ khóa, skill hoặc level.",
        parameters: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Từ khóa trong tiêu đề hoặc mô tả job (vd: backend, react, java)"
            },
            skill: {
              type: "string",
              description: "Tên kỹ năng chính (vd: React, Node.js, Java)"
            },
            level: {
              type: "string",
              enum: ["cơ bản", "thành thạo", "chuyên sâu", "senior", "expert"], // Cập nhật enum để khớp với LEVEL_MAP
              description: "Cấp độ job"
            }
          },
          additionalProperties: false
        }
      },

      // 2. recommendJobsForCandidate
      {
        name: "recommendJobsForCandidate",
        description:
          "Gợi ý job phù hợp khi candidate KHÔNG nhập tiêu chí cụ thể, chỉ muốn biết job nào hợp với mình.",
        parameters: {
          type: "object",
          properties: {
            candidateId: {
              type: "string",
              description: "ID của candidate"
            }
          },
          required: ["candidateId"],
          additionalProperties: false
        }
      },

      // 3. recommendCandidatesForJob
      {
        name: "recommendCandidatesForJob",
        description:
          "Gợi ý các ứng viên phù hợp nhất cho một job dựa trên skill và level yêu cầu.",
        parameters: {
          type: "object",
          properties: {
            jobId: {
              type: "string",
              description: "ID của job"
            }
          },
          required: ["jobId"],
          additionalProperties: false
        }
      },

      // 4. analyzeCandidateGapForJob
      {
        name: "analyzeCandidateGapForJob",
        description:
          "Phân tích candidate còn thiếu kỹ năng hoặc kinh nghiệm gì để apply vào một job cụ thể.",
        parameters: {
          type: "object",
          properties: {
            candidateId: {
              type: "string",
              description: "ID của candidate"
            },
            jobId: {
              type: "string",
              description: "ID của job"
            }
          },
          required: ["candidateId", "jobId"],
          additionalProperties: false
        }
      }
    ]
  }
];
