import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import companyService from "../services/company.service";
import jobService from "../services/job.service";
import companyLogoPlaceholder from '../assets/company-logo-placeholder.svg';
import chatIcon from '../assets/chat.svg'; // Import chat icon
import authService from "../services/auth.service";
import { useChat } from '../ChatContext'; // Import useChat

// Moved InfoField outside to be a standalone component
const InfoField = ({ label, value }) => (
  <div className="mb-4">
    <p className="block font-bold mb-1 text-white">{label}</p>
    <div className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2">
      {value || "N/A"}
    </div>
  </div>
);

const CompanyInfoPage = ({ isCurrentUser }) => {
  const { companyId: paramCompanyId } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const { openChat } = useChat(); // Use the chat context

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        let companyData = null;
        const currentUser = authService.getCurrentUser(); // Get current user here

        if (isCurrentUser) {
          const response = await companyService.getCompany();
          if (!response.data || !response.data.data) {
            navigate("/company/createOrEdit");
            return;
          }
          companyData = response.data.data;
          setCompany(companyData);
          localStorage.setItem("company", JSON.stringify(companyData));

          // This part updates the user role in localStorage if a company profile exists.
          // It's consistent with how candidate role is handled in CandidatePage.jsx.
          const user = JSON.parse(localStorage.getItem("user"));
          if (user && user.user) {
            user.user.roles.company = true;
            localStorage.setItem("user", JSON.stringify(user));
          }

          // If it's the current user's page, they are the owner
          setIsOwner(true);

        } else {
          if (!paramCompanyId) {
            setLoading(false);
            return;
          }
          const response = await companyService.getCompanyById(paramCompanyId);
          companyData = response;
          setCompany(companyData);

          // Check if the logged-in user is the owner of this company profile
          if (currentUser && currentUser.user._id === companyData.ownerId) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        }

        if (companyData) {
          const jobsResponse = await jobService.getJobsByCompany(companyData._id);  
          console.log("Jobs response:", jobsResponse); // Debug log to check the response structure        
          // Ensure jobsResponse.data.data is an array before setting state
          if (jobsResponse.data && Array.isArray(jobsResponse.data)) {
            setJobs(jobsResponse.data);
          } else {
            setJobs([]); // Set to empty array if data is not an array
          }
        }

      } catch (error) {
        console.error("Error fetching company:", error);
        setCompany(null);
        setIsOwner(false); // Reset isOwner on error
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [paramCompanyId, navigate, isCurrentUser]); // Added isCurrentUser to dependencies

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">Đang tải thông tin công ty...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        {company ? (
          <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-600 flex-shrink-0">
                  <img
                    src={company.logoURL ? `http://localhost:4000/${company.logoURL}` : companyLogoPlaceholder}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-3xl font-bold text-green-500">
                  Công ty {company.name}
                </h1>
              </div>

              <div className="flex gap-4">
                {isOwner ? ( // Use isOwner here
                  <>
                    <Link
                      to="/company/createOrEdit"
                      className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-green-700"
                    >
                      Chỉnh sửa hồ sơ
                    </Link>
                    <Link
                      to="/company/create-job"
                      className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700"
                    >
                      Đăng tin
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => openChat(company.ownerId, company.name, 'company')}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-green-700"
                  >
                    <img src={chatIcon} alt="Chat" className="h-5 w-5" />
                    <span>Nhắn tin</span>
                  </button>
                )}
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-8 border-b border-gray-700 pb-6">
              <InfoField label="Website" value={company.website} />
              <InfoField label="Email" value={company.email} />
            </div>

            {/* Details Section */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-green-400">Mô tả công ty</h3>
                <div className="bg-gray-700 p-4 rounded-lg leading-relaxed">
                  {company.description || "Chưa có mô tả."}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Mã số thuế" value={company.TIN} />
                <InfoField label="Loại hình công ty" value={company.companyType} />
                <InfoField label="Lĩnh vực chính" value={company.mainOccupation} />
                <InfoField label="Năm thành lập" value={company.foundedYear} />
                <div className="md:col-span-2">
                  <InfoField label="Địa chỉ" value={company.location} />
                </div>
              </div>

              {/* Jobs List */}
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4 text-green-400 border-b border-gray-700 pb-2">
                  Công việc đã đăng ({jobs.length})
                </h3>
                <div className="space-y-4">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <Link 
                        to={`/jobs/${job._id}`} 
                        key={job._id} 
                        className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition border-l-4 border-green-500"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-lg">{job.title}</h4>
                          <p className="text-sm text-gray-400">
                            Hạn: {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">Chưa có công việc nào được đăng.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-20 bg-gray-800 rounded-lg">
            <p className="text-xl">Không tìm thấy thông tin công ty.</p>
            <button onClick={() => navigate("/")} className="mt-4 text-green-500 hover:underline">Quay lại trang chủ</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyInfoPage;