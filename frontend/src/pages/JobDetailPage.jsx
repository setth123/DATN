import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jobService from "../services/job.service";
import companyService from "../services/company.service";
import authService from "../services/auth.service";
import locationIcon from "../assets/location.svg";
import emailIcon from "../assets/email.svg";
import websiteIcon from "../assets/website.svg";

const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [applications, setApplications] = useState([]);

  useEffect(() => {
    jobService.getJobById(id).then(
      (response) => {
        setJob(response.data.data);
        console.log(response.data.data);
        companyService.getCompanyById(response.data.data.companyId._id).then(
          (companyResponse) => {
            setCompany(companyResponse.data.data);
          },
          (error) => {
            console.log(error);
          }
        );
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.company && currentUser.company._id === response.data.data.companyId) {
            setIsOwner(true);
            jobService.getApplicationsForJob(id).then(
                (appsResponse) => {
                    setApplications(appsResponse.data);
                },
                (error) => {
                    console.log(error);
                }
            )
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }, [id]);

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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InfoField icon="location" label="Location" value={company.location} />
            <InfoField icon="email" label="Email" value={company.email} />
            <InfoField icon="website" label="Website" value={<a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{company.website}</a>} />
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
            <InfoField label="Start Date" value={new Date(job.startDate).toLocaleDateString()} />
            <InfoField label="End Date" value={new Date(job.endDate).toLocaleDateString()} />
            {isOwner && <InfoField label="Applications" value={job.applicationsNum} />}
          </div>
        </div>

        {isOwner && (
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-green-400">
                    Ứng viên
                </h3>
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <p>{app.candidateId.fullname}</p>
                            <a href={`http://localhost:4000/${app.candidateId.cv}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View CV</a>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};



const InfoField = ({ icon, label, value }) => {
    const icons = {
        location: <img src={locationIcon} alt="Location" className="h-6 w-6 mr-2" />,
        email: <img src={emailIcon} alt="Email" className="h-6 w-6 mr-2" />,
        website: <img src={websiteIcon} alt="Website" className="h-6 w-6 mr-2" />
    }
    return (
        <div className="flex items-center bg-gray-700 p-4 rounded-lg">
            {icons[icon]}
            <div>
                <p className="block font-bold mb-1 text-white">{label}</p>
                <p>{value || "N/A"}</p>
            </div>
      </div>
    )
}

export default JobDetailPage;
