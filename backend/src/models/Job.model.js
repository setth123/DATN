import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    requiredSkills: [
      {
        name: String,
        level: {
          type: String,
          enum: [
            "Cơ bản",
            "Trung bình",
            "Khá",
            "Thành thạo",
            "Chuyên gia"
          ]
        }
      }
    ],

    level: {
      type: String,
      enum: ["Intern", "Junior", "Mid", "Senior"]
    },

    salaryRange: String,

    startDate: Date,
    endDate: Date,

    applicationsNum: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

jobSchema.index({
  title: "text",
  description: "text",
  requiredSkills: "text"
});
export default mongoose.model("Job", jobSchema);
