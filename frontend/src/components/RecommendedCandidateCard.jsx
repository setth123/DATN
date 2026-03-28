import React from "react";
import { useNavigate } from "react-router-dom";
import userAvatar from '../assets/user-avatar.svg';
import openToWorkAvatar from '../assets/open-to-work.png';

const RecommendedCandidateCard = ({ candidate }) => {
  const navigate = useNavigate();
  const handleMessageClick = () => {
    navigate(`/candidate/${candidate._id}`);
  };
  console.log(candidate);
  return (
    <div className="flex-none w-48 p-4 bg-gray-700 rounded-lg shadow-md flex flex-col items-center justify-between">
      <img
        src={candidate.candidate.isOpenToWork ? openToWorkAvatar : userAvatar}
        alt="Candidate Avatar"
        className="h-20 w-20 rounded-full object-cover mb-3 border-2 border-gray-600"
      />
      <p className="text-white font-semibold text-center mb-3 truncate w-full">
        {candidate.candidate.fullName}
      </p>
      <button
        onClick={handleMessageClick}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm w-full"
      >
        Nhắn tin
      </button>
    </div>
  );
};

export default RecommendedCandidateCard;