import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import candidateService from "../services/candidate.service";
import userAvatar from '../assets/user-avatar.svg';
import openToWorkAvatar from '../assets/open-to-work.png';
import chatIcon from '../assets/chat.svg'; // Import chat icon
import applicationService from "../services/application.service";
import trashIcon from '../assets/trash.svg';
import authService from "../services/auth.service";
import { useChat } from '../ChatContext'; // Import useChat

const CandidatePage = ({ isCurrentUser }) => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(authService.getCurrentCandidate());
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { openChat } = useChat(); // Use the chat context

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        let response;
        if (isCurrentUser) {
          response = await candidateService.getMe();
          if (!response.data || !response.data.data) {
            navigate("/candidate/createOrEdit");
            return;
          }
          const data = response.data.data;
          setCandidate(data);
          localStorage.setItem("candidate", JSON.stringify(data));
          
          const user = JSON.parse(localStorage.getItem("user"));
          if (user && user.user) {
            user.user.roles.candidate = true;
            localStorage.setItem("user", JSON.stringify(user));
          }
        } else {
          if (!candidateId) {
            setLoading(false);
            return;
          }
          response = await candidateService.getCandidateById(candidateId);
          setCandidate(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [navigate, isCurrentUser, candidateId]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (isCurrentUser) {
        try {
          const response = await applicationService.getMyApplication();
          if (response.data && response.data.data) {
            setAppliedJobs(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching applied jobs:", error);
        }
      }
    };
    fetchAppliedJobs();
  }, [isCurrentUser]);

  const handleCancelApplication = async (jobId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy ứng tuyển không?")) {
      try {
        await applicationService.cancelApply(jobId);
        setAppliedJobs(appliedJobs.filter(app => app.jobId._id !== jobId));
        alert("Hủy ứng tuyển thành công!");
      } catch (error) {
        console.error("Error canceling application:", error);
        alert("Hủy ứng tuyển thất bại.");
      }
    }
  };

  if (loading) {
    return <div className="text-white text-center p-8">Đang tải hồ sơ...</div>;
  }

  if (!candidate) {
    return <div className="text-white text-center p-8">Không tìm thấy hồ sơ ứng viên.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div className="flex items-center gap-4">
              <img
                src={candidate.isOpenToWork ? openToWorkAvatar : userAvatar}
                alt="User Avatar"
                className="h-24 w-24 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <h1 className="text-3xl font-bold text-green-500">{candidate.fullName}</h1>
                <p className="text-xl text-gray-300">{candidate.title || "Chưa cập nhật tiêu đề nghề nghiệp"}</p>
              </div>
            </div>

            <div className="flex gap-4">
              {isCurrentUser ? (
                <button
                  onClick={() => navigate("/candidate/createOrEdit")}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700"
                >
                  Chỉnh sửa hồ sơ
                </button>
              ) : (
                <button
                  onClick={() => openChat( candidate.userId,  candidate.fullName , 'candidate')}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-green-700"
                >
                  <img src={chatIcon} alt="Chat" className="h-5 w-5" />
                  Nhắn tin
                </button>
              )}
            </div>
          </div>

          {/* Bio section */}
          <div className="mb-8 bg-gray-700/50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2 text-green-400">Giới thiệu bản thân</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{candidate.bio || "Chưa có giới thiệu."}</p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-6 mt-6">
            <div>
              <h2 className="text-xl font-bold mb-2 text-green-400">Thông tin liên hệ</h2>
              <p className="text-gray-300"><strong>Email:</strong> {candidate.email}</p>
              <p className="text-gray-300"><strong>Số điện thoại:</strong> {candidate.phone || "N/A"}</p>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-gray-700 pt-6">
            {/* Skills */}
            <div>
              <h2 className="text-xl font-bold mb-3 text-green-400">Kỹ năng</h2>
              <ul className="grid grid-cols-1 gap-2">
                {candidate.skills?.map((skill, index) => (
                  <li key={index} className="bg-gray-700 px-3 py-1 rounded-md text-sm">
                    <span className="font-bold text-green-500">{skill.name}</span> — {skill.level}
                  </li>
                )) || <p className="text-gray-500 italic">Chưa cập nhật kỹ năng</p>}
              </ul>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-xl font-bold mb-3 text-green-400">Học vấn</h2>
              <ul className="space-y-3">
                {candidate.education?.map((edu, index) => (
                  <li key={index} className="border-l-2 border-gray-600 pl-3">
                    <p className="font-bold">{edu.degree}</p>
                    <p className="text-sm text-gray-400">{edu.school} ({edu.startYear} - {edu.endYear})</p>
                  </li>
                )) || <p className="text-gray-500 italic">Chưa cập nhật học vấn</p>}
              </ul>
            </div>

            {/* Experiences */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-3 text-green-400">Kinh nghiệm làm việc</h2>
              <div className="space-y-4">
                {candidate.experiences?.map((exp, index) => (
                  <div key={index} className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="font-bold text-lg">{exp.position} tại {exp.company}</h3>
                    <p className="text-sm text-gray-400">
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} - 
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Hiện tại'}
                    </p>
                    <p className="mt-2 text-gray-300">{exp.description}</p>
                  </div>
                )) || <p className="text-gray-500 italic">Chưa cập nhật kinh nghiệm</p>}
              </div>
            </div>

            {/* Resumes */}
            {isCurrentUser && candidate.resumes?.length > 0 && (
              <div className="md:col-span-2 mt-4">
                <h2 className="text-xl font-bold mb-3 text-green-400">Danh sách CV</h2>
                <div className="flex flex-wrap gap-3">
                  {candidate.resumes.map((resume, index) => (
                    <a
                      key={index}
                      href={`http://localhost:4000/${resume.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-900/30 border border-blue-500 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
                    >
                      {resume.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Applied Jobs */}
            {isCurrentUser && appliedJobs.length > 0 && (
              <div className="md:col-span-2 mt-8 border-t border-gray-700 pt-6">
                <h2 className="text-xl font-bold mb-4 text-green-400">Công việc đã ứng tuyển</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {appliedJobs.map((application) => (
                    <div
                      key={application.jobId._id}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-transparent hover:border-green-500 transition group"
                    >
                      <Link to={`/jobs/${application.jobId._id}`} className="flex-grow">
                        <h3 className="font-bold text-lg group-hover:text-green-400">{application.jobId.title}</h3>
                        <p className="text-sm text-gray-400">{application.jobId.companyId?.name}</p>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleCancelApplication(application.jobId._id);
                        }}
                        className="ml-4 p-2 rounded-full hover:bg-red-900/50 transition-colors"
                        title="Hủy ứng tuyển"
                      >
                        <img src={trashIcon} alt="Hủy" className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;