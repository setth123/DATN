import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import candidateService from "../services/candidate.service";
import userAvatar from '../assets/user-avatar.svg';
import openToWorkAvatar from '../assets/open-to-work.png';
import applicationService from "../services/application.service"; // Import applicationService
import trashIcon from '../assets/trash.svg'; // Import trash icon

const CandidatePage = ({ isCurrentUser }) => {
  const { candidateId } = useParams(); // Get candidateId from URL params
  const [candidate, setCandidate] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]); // State for applied jobs
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        let response;
        if (isCurrentUser) {
          response = await candidateService.getMe();
          if (!response.data.data) {
            navigate("/candidate/createOrEdit");
            return;
          }
          setCandidate(response.data.data);
          localStorage.setItem("candidate", JSON.stringify(response.data.data));
          const user = JSON.parse(localStorage.getItem("user"));
          if (user && user.user) { // Ensure user and user.user exist before modifying
            user.user.roles.candidate = true;
            localStorage.setItem("user", JSON.stringify(user));
          }
        } else {
          if (!candidateId) {
            console.error("Candidate ID is missing from URL for non-current user.");
            setLoading(false);
            return;
          }
          // Assuming candidateService has a getCandidateById method
          response = await candidateService.getCandidateById(candidateId);
          setCandidate(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching candidate or user data:", error);
        setCandidate(null); // Clear candidate data on error
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [navigate, isCurrentUser, candidateId]); // Add isCurrentUser and candidateId to dependencies

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
    if (window.confirm("Bạn có chắc chắn muốn hủy ứng tuyển công việc này không?")) {
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

  if (loading || !candidate) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {candidate && (
// ... other code

          <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={candidate.isOpenToWork ? openToWorkAvatar : userAvatar}
                  alt="User Avatar"
                  className="h-24 w-24 rounded-full"
                />
                <div>
                  <h1 className="text-3xl font-bold text-green-500">{candidate.fullName}</h1>
                  <p className="text-xl text-gray-300 mb-4">{candidate.title}</p>
                </div>
              </div>
              {isCurrentUser && (
                <button
                  onClick={() => navigate("/candidate/createOrEdit")}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700"
                >
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>

            {/* Bio section */}
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-green-400">Giới thiệu bản thân</h2>
                <p className="text-gray-400">{candidate.bio}</p>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-700 pt-4 mt-6">
                <h2 className="text-xl font-bold mb-2 text-green-400">Thông tin liên hệ</h2>
                <p className="text-gray-300"><strong>Email:</strong> {candidate.email}</p>
                <p className="text-gray-300"><strong>Số điện thoại:</strong> {candidate.phone || "N/A"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 border-t border-gray-700 pt-4">
              <div>
                <h2 className="text-xl font-bold mb-2 text-green-400">Skills</h2>
                <ul className="list-disc list-inside">
                  {candidate.skills.map((skill, index) => (
                    <li key={index}>{skill.name} - {skill.level}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2 text-green-400">Education</h2>
                <ul className="list-disc list-inside">
                  {candidate.education.map((edu, index) => (
                    <li key={index}>
                      {edu.degree} at {edu.school} ({edu.startYear} - {edu.endYear})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold mb-2 text-green-400">Experiences</h2>
                <ul className="space-y-4">
                  {candidate.experiences.map((exp, index) => (
                    <li key={index} className="p-4 bg-gray-700 rounded-lg">
                      <h3 className="font-bold">{exp.position} at {exp.company}</h3>
                      <p className="text-sm text-gray-400">{new Date(exp.startDate).toLocaleDateString()} - {new Date(exp.endDate).toLocaleDateString()}</p>
                      <p className="mt-2">{exp.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {isCurrentUser && candidate.resumes && candidate.resumes.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-2 text-green-400">CVs</h2>
                  <ul className="list-disc list-inside">
                    {candidate.resumes.map((resume, index) => (
                      <li key={index}>
                        <a
                          href={`http://localhost:4000/${resume.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {resume.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isCurrentUser && appliedJobs.length > 0 && (
                <div className="md:col-span-2 mt-6 border-t border-gray-700 pt-4">
                  <h2 className="text-xl font-bold mb-4 text-green-400">Công việc đã ứng tuyển</h2>
                  <div className="space-y-4">
                    {appliedJobs.map((application) => (
                      <div
                        key={application.jobId._id}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                      >
                        <Link to={`/jobs/${application.jobId._id}`} className="flex-grow">
                          <h3 className="font-bold text-lg">{application.jobId.title}</h3>
                          <p className="text-sm text-green-400">{application.jobId.companyId.name}</p>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigating to job detail when clicking trash
                            handleCancelApplication(application.jobId._id);
                          }}
                          className="ml-4 p-2 rounded-full hover:bg-red-700 transition"
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
        )}
      </div>
    </div>
  );
};

export default CandidatePage;