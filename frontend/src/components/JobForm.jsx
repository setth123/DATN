import { useState } from "react";
import { useNavigate } from "react-router-dom";
import jobService from "../services/job.service";
import plusIcon from '../assets/plus.svg';
import trashIcon from '../assets/trash.svg';

const JobForm = () => {
  const [job, setJob] = useState({
    title: "",
    description: "",
    requiredSkills: [],
    level: "Intern",
    salaryRange: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const [skill, setSkill] = useState({ name: "", level: "Cơ bản" });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJob({ ...job, [name]: value });
  };

  const handleSkillChange = (e) => {
    const { name, value } = e.target;
    setSkill({ ...skill, [name]: value });
  };

  const handleAddSkill = () => {
    if (skill.name && skill.level) {
      setJob({ ...job, requiredSkills: [...job.requiredSkills, skill] });
      setSkill({ name: "", level: "Cơ bản" });
    }
  };

  const handleRemoveSkill = (index) => {
    const skills = [...job.requiredSkills];
    skills.splice(index, 1);
    setJob({ ...job, requiredSkills: skills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await jobService.createJob(job);
      alert("Tạo công việc thành công!");
      navigate("/company/me");
    } catch (error) {
      console.error("Lỗi khi tạo công việc:", error);
      alert("Tạo công việc thất bại.");
    }
  };

  const inputStyle = "w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500";
  const labelStyle = "block font-bold mb-1 text-white";
  const buttonStyle = "rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-green-700";
  const addButtonStyle = "rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700";
  const removeButtonStyle = "rounded-lg bg-red-600 px-3 py-1 font-bold text-white transition duration-300 hover:bg-red-700";
  const sectionTitleStyle = "text-xl font-bold text-green-500 mt-6 mb-4";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-green-500">
            Tạo tin tuyển dụng mới
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className={labelStyle}>
                Tiêu đề  *
              </label>
              <input type="text" name="title" id="title" value={job.title} onChange={handleInputChange} className={inputStyle} required />
            </div>
            <div>
              <label htmlFor="description" className={labelStyle}>
                Mô tả công việc *
              </label>
              <textarea name="description" id="description" value={job.description} onChange={handleInputChange} rows={4} className={inputStyle} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="level" className={labelStyle}>
                  Cấp bậc
                </label>
                <select name="level" id="level" value={job.level} onChange={handleInputChange} className={inputStyle}>
                  <option>Intern</option>
                  <option>Junior</option>
                  <option>Mid</option>
                  <option>Senior</option>
                </select>
              </div>
              <div>
                <label htmlFor="salaryRange" className={labelStyle}>
                  Mức lương 
                </label>
                <input type="text" name="salaryRange" id="salaryRange" value={job.salaryRange} onChange={handleInputChange} className={inputStyle} placeholder="Vd: 500 - 1000 USD" />
              </div>
              <div>
                <label htmlFor="startDate" className={labelStyle}>
                  Ngày bắt đầu đăng *
                </label>
                <input type="date" name="startDate" id="startDate" value={job.startDate} onChange={handleInputChange} className={inputStyle} required />
              </div>
              <div>
                <label htmlFor="endDate" className={labelStyle}>
                  Ngày đóng hạn *
                </label>
                <input type="date" name="endDate" id="endDate" value={job.endDate} onChange={handleInputChange} className={inputStyle} required />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className={sectionTitleStyle}>Kỹ năng yêu cầu</h3>
              <div className="space-y-4">
                <div className="flex items-end space-x-4">
                  <div className="flex-grow">
                    <label className={labelStyle}>Tên kỹ năng</label>
                    <input type="text" name="name" placeholder="Vd: ReactJS" value={skill.name} onChange={handleSkillChange} className={inputStyle} />
                  </div>
                  <div className="flex-grow">
                    <label className={labelStyle}>Cấp độ</label>
                    <select name="level" value={skill.level} onChange={handleSkillChange} className={inputStyle}>
                      <option>Cơ bản</option>
                      <option>Trung bình</option>
                      <option>Khá</option>
                      <option>Thành thạo</option>
                      <option>Chuyên gia</option>
                    </select>
                  </div>
                  import plusIcon from '../assets/plus.svg';
import trashIcon from '../assets/trash.svg';

//... other code
                  <button type="button" onClick={handleAddSkill} className={`${addButtonStyle} flex items-center`}>
                    <img src={plusIcon} alt="Add" className="h-4 w-4 mr-2" />
                    Thêm
                  </button>
                </div>
                <ul className="space-y-2 pt-2">
                  {job.requiredSkills.map((s, index) => (
                    <li key={index} className="flex items-center justify-between rounded-lg bg-gray-700 px-4 py-2">
                      <span className="font-medium">{s.name} - {s.level}</span>
                      <button type="button" onClick={() => handleRemoveSkill(index)} className={`${removeButtonStyle} flex items-center`}>
                        <img src={trashIcon} alt="Remove" className="h-4 w-4 mr-1" />
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
//... other code
              </div>
            </div>

            <div>
              <button type="submit" className={`${buttonStyle} w-full`}>
                Tạo công việc
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default JobForm;
