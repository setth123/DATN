export const tools = [
  {
    functionDeclarations: [

      // 1. searchJobs
      {
        name: "searchJobs",
        description:
          `Tìm kiếm job khi người dùng CHỦ ĐỘNG nhập tiêu chí cụ thể như từ khóa, skill hoặc level.
          Dữ liệu trả về bao gồm url của job và title của job. Hãy hiển thị theo dạng "title - url" để người dùng dễ nhìn và có thể click vào url để xem chi tiết job.`,
        parameters: {
          type: "object",
          properties: {
            keyword:{
              type: "string",
              description: "Từ khóa trong tiêu đề job"
            },
            skill: {
              type: "object", 
              properties: {
                name: {
                  type: "string",
                  description: "Tên kỹ năng chính (vd: React, Node.js, Java)"
                },
                level: {
                  type: "string",
                  enum: ["Cơ bản", "Trung bình", "Khá", "Thành thạo", "Chuyên gia"],
                  description: "Cấp độ kỹ năng"
                }
              },
              required: ["name"] // Bắt buộc phải có tên skill nếu dùng object này
            },
            level: {
              type: "string",
              enum: ["Intern","Fresher", "Junior", "Mid", "Senior"], // Cập nhật enum để khớp với LEVEL_MAP
              description: "Cấp độ job"
            }
          },
       //   additionalProperties: false
        }
      },

      // 2. recommendJobsForCandidate
      {
        name: "recommendJobsForCandidate",
        description:
          `Gợi ý job phù hợp khi candidate KHÔNG nhập tiêu chí cụ thể, chỉ muốn biết job nào hợp với mình.
          Dữ liệu trả về bao gồm url của job, title của job và điểm phù hợp (match score). Hãy hiển thị theo dạng "title - matchScore - url" để người dùng dễ nhìn và có thể click vào url để xem chi tiết job.`,
        parameters: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "ID của user"
            }
          },
          required: ["userId"],
      //    additionalProperties: false
        }
      },

      // 3. recommendCandidatesForJob
      {
        name: "recommendCandidatesForJob",
        description:
          `Gợi ý các ứng viên phù hợp nhất cho một job dựa trên skill và level yêu cầu.
          Dữ liệu trả về bao gồm url hồ sơ của ứng viên, fullname, title của ứng viên, và điểm phù hợp (match score). Hãy hiển thị theo dạng "fullname - title - matchScore - url" để nhà tuyển dụng dễ nhìn và có thể click vào url để xem chi tiết hồ sơ ứng viên.`,
        parameters: {
          type: "object",
          properties: {
            jobId: {
              type: "string",
              description: "ID của job"
            }
          },
          required: ["jobId"],
      //    additionalProperties: false
        }
      },

      // 4. analyzeCandidateGapForJob
      {
        name: "analyzeCandidateGapForJob",
        description:
          `Phân tích candidate còn thiếu kỹ năng hoặc kinh nghiệm gì để apply vào một job cụ thể.
          Dữ liệu trả về bao gồm tên job, tên candidate, các kỹ năng còn thiếu (nếu có), và khoảng cách về cấp độ (nếu có)`,
        parameters: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "ID của user"
            },
            jobId: {
              type: "string",
              description: "ID của job"
            }
          },
          required: ["userId", "jobId"],
      //    additionalProperties: false
        }
      }
    ]
  }
];
