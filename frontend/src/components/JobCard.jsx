import React from "react";
import { Link } from "react-router-dom";
import companyLogoPlaceholder from '../assets/company-logo-placeholder.svg';

const JobCard = ({ job }) => {
  if (!job) return null; // Handle cases where job prop might be null or undefined

  return (
    <Link to={`/jobs/${job._id}`} className="block">
      <div className="rounded-lg bg-gray-800 p-6 shadow-lg transition-shadow duration-300 hover:shadow-green-500/20 h-full flex flex-col">
        <div className="mb-4 flex items-center">
          <img
            src={job.companyLogo ? `http://localhost:4000/${job.companyLogo}` : companyLogoPlaceholder}
            alt={`${job.companyId?.name || 'Company'} Logo`}
            className="mr-4 h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-bold text-green-500">{job.title}</h3>
            <p className="text-gray-400">{job.companyId?.name || 'N/A'}</p>
          </div>
        </div>
        <p className="mb-4 text-gray-300 flex-grow">
          {job.description.substring(0, 100)}... {/* Truncate description */}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-400 mt-auto">
          <span>{job.companyId?.location?.split(',').pop().trim() || 'N/A'}</span> {/* Display only city/province */}
          <span>{job.level}</span>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
