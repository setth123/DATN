import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import companyService from "../services/company.service";
import jobService from "../services/job.service";
import companyLogoPlaceholder from '../assets/company-logo-placeholder.svg';

const CompanyInfoPage = (isCurrentUser) => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    companyService.getCompany().then(
      (response) => {
        if (response.data.data) {
          setCompany(response.data.data);
          localStorage.setItem("company", JSON.stringify(response.data.data));
          const user=JSON.parse(localStorage.getItem("user"));
          user.user.roles.recruiter=true;
          localStorage.setItem("user", JSON.stringify(user));
          const companyId = response.data.data._id;
          jobService.getJobsByCompany(companyId).then(
            (jobResponse) => {
              setJobs(jobResponse.data);
            },
            (error) => {
              console.log(error);
            }
          );

        } else {
          navigate("/company/createOrEdit");
        }
      },
      (error) => {
        console.log(error);
        navigate("/company/createOrEdit");
      }
    );
  }, [navigate]);

  const InfoField = ({ label, value }) => (
    <div>
      <p className="block font-bold mb-1 text-white">{label}</p>
      <p className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2">
        {value || "N/A"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        {company ? (
          <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-6">
              import companyLogoPlaceholder from '../assets/company-logo-placeholder.svg';

// ... other code

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-600">
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
              {isCurrentUser &&(
                <div className="flex gap-4">
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
                  Đăng tin tuyển dụng
                </Link>
              </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 flex-grow mb-8">
              <InfoField label="Website" value={company.website} />
              <InfoField label="Email" value={company.email} />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2 text-green-400">
                  Mô tả công ty
                </h3>
                <p className="bg-gray-700 p-4 rounded-lg">
                  {company.description || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Mã số thuế" value={company.TIN} />
                <InfoField
                  label="Loại hình công ty"
                  value={company.companyType}
                />
                <InfoField
                  label="Lĩnh vực chính"
                  value={company.mainOccupation}
                />
                <InfoField
                  label="Năm thành lập"
                  value={company.foundedYear}
                />
                <div className="md:col-span-2">
                  <InfoField label="Địa chỉ" value={company.location} />
                </div>
              </div>

              <div className="mt-8 border border-gray-600 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  Công việc đã đăng
                </h3>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Link to={`/jobs/${job._id}`} key={job._id} className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-lg">{job.title}</h4>
                        <p className="text-sm text-gray-400">
                          {new Date(job.startDate).toLocaleDateString()} - {new Date(job.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center">Loading company information...</p>
        )}
      </main>
    </div>
  );
};

export default CompanyInfoPage;

