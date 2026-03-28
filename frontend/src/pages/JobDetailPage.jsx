import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import jobService from "../services/job.service";
import companyService from "../services/company.service";
import authService from "../services/auth.service";
import locationIcon from "../assets/location.svg";
import recommendedService from "../services/recommend.service";
import emailIcon from "../assets/email.svg";
import websiteIcon from "../assets/website.svg";
import ApplyModal from "../components/ApplyModal";
import userAvatar from '../assets/user-avatar.svg'; // Import user avatar placeholder
import RecommendedCandidateCard from "../components/RecommendedCandidateCard";
import openToWorkAvatar from '../assets/open-to-work.png'; // Import open-to-work avatar

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const currentUser = authService.getCurrentUser();
  const currentCompany = authService.getCurrentCompany();
  const currentCandidate=authService.getCurrentCandidate();
  useEffect(() => {
    jobService.getJobById(id).then(
      (response) => {
        setJob(response.data.data);
        companyService.getCompanyById(response.data.data.companyId._id).then(
          (companyResponse) => {
            setCompany(companyResponse.data.data);
          },
          (error) => {
            console.log(error);
          }
        );
        if (currentCompany && currentCompany._id === response.data.data.companyId._id) {
          setIsOwner(true);
          companyService.getApplicationsForJob(id).then(
            (appsResponse) => {
              setApplications(appsResponse.data.applications);
            },
            (error) => {
              console.log(error);
            }
          );

          // Fetch recommended candidates for the job if the current user is the owner
          recommendedService.recommendCandidateForJob(id).then(
            (recResponse) => {
              setRecommendedCandidates(recResponse.data.candidates);
            },
            (error) => console.log("Error fetching recommended candidates:", error)
          );
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }, [id]);

  const handleApplyClick = () => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }
    if (isOwner) {
      alert("You cannot apply to your own job posting.");
      return;
    }
    if(!currentCandidate){
      navigate("/candidate/createOrEdit");
      return;
    }
    setShowApplyModal(true);
  };

  const handleApplySuccess = (message) => {
    alert(message);
  };

  if (!job || !company) {
    return <p className="text-center">Loading job details...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          {company.logoURL && (
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-600 mr-4">
              <img
                src={`http://localhost:4000/${company.logoURL}`}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-green-500">{job.title}</h1>
            <p className="text-xl text-gray-400">{company.name}</p>
            {isOwner && (
              <Link
                to={`/job/edit/${job._id}`}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="mr-2" /> Chỉnh sửa tin tuyển dụng
              </Link>
            )}
          </div>
          {currentUser && currentUser.user.roles.candidate && !isOwner && (
            <div className="ml-auto">
              <button
                onClick={handleApplyClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Ứng tuyển
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InfoField icon="location" label="Location" value={company.location} />
          <InfoField icon="email" label="Email" value={company.email} />
          <InfoField
            icon="website"
            label="Website"
            value={
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {company.website}
              </a>
            }
          />
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2 text-green-400">
              Job Description
            </h3>
            <p className="bg-gray-700 p-4 rounded-lg">{job.description}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2 text-green-400">
              Required Skills
            </h3>
            <ul className="list-disc list-inside bg-gray-700 p-4 rounded-lg">
              {job.requiredSkills.map((skill, index) => (
                <li key={index}>
                  {skill.name} - {skill.level}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Level" value={job.level} />
            <InfoField label="Salary Range" value={job.salaryRange} />
            <InfoField
              label="Start Date"
              value={new Date(job.startDate).toLocaleDateString()}
            />
            <InfoField
              label="End Date"
              value={new Date(job.endDate).toLocaleDateString()}
            />
            {isOwner && (
              <InfoField label="Applications" value={job.applicationsNum} />
            )}
          </div>
        </div>

        {isOwner && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-green-400">
              Ứng viên đã ứng tuyển
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max-h and overflow for scrollability */}
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Link to={`/candidate/${app.candidateId._id}`} className="flex items-center gap-3 group">
                      <img
                        src={app.candidateId.isOpenToWork ? openToWorkAvatar : userAvatar}
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-green-500 transition-colors"
                        />
                      <p className="font-semibold text-lg group-hover:text-green-400 transition-colors">
                        {app.candidateId.fullName}
                      </p>
                    </Link>
                  </div>
                        {app.cvSnapshotUrl && (
                          <a
                            href={`http://localhost:4000/${app.cvSnapshotUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm mr-2"
                          >
                            Tải CV
                          </a>
                        )}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    Nhắn tin
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOwner && recommendedCandidates.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-green-400">
              Gợi ý ứng viên
            </h3>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {recommendedCandidates.map((candidate) => (
                <RecommendedCandidateCard
                  key={candidate._id}
                  candidate={candidate}
                />
              ))}
            </div>
          </div>
        )}

      </div>
      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onApplySuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

const InfoField = ({ icon, label, value }) => {
  const icons = {
    location: <img src={locationIcon} alt="Location" className="h-6 w-6 mr-2" />,
    email: <img src={emailIcon} alt="Email" className="h-6 w-6 mr-2" />,
    website: <img src={websiteIcon} alt="Website" className="h-6 w-6 mr-2" />,
  };
  return (
    <div className="flex items-center bg-gray-700 p-4 rounded-lg">
      {icons[icon]}
      <div>
        <p className="block font-bold mb-1 text-white">{label}</p>
        <p>{value || "N/A"}</p>
      </div>
    </div>
  );
};

export default JobDetailPage;
