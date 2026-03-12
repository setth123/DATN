import React from "react";

const JobCard = () => {
  return (
    <div className="rounded-lg bg-gray-800 p-6 shadow-lg transition-shadow duration-300 hover:shadow-green-500/20">
      <div className="mb-4 flex items-center">
        <img
          src="https://via.placeholder.com/48"
          alt="Company Logo"
          className="mr-4 h-12 w-12 rounded-full"
        />
        <div>
          <h3 className="text-xl font-bold">Software Engineer</h3>
          <p className="text-gray-400">Tech Solutions Inc.</p>
        </div>
      </div>
      <p className="mb-4 text-gray-300">
        We are looking for a skilled Software Engineer to join our dynamic team.
      </p>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>New York, NY</span>
        <span>Full-time</span>
      </div>
    </div>
  );
};

export default JobCard;
