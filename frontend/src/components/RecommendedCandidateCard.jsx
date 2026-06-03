import React from "react";
import { useNavigate } from "react-router-dom";
import userAvatar from '../assets/user-avatar.svg';
import openToWorkAvatar from '../assets/open-to-work.png';
import { useChat } from '../ChatContext';

const RecommendedCandidateCard = ({ candidate }) => {
  const navigate = useNavigate();
  const { openChat } = useChat();

  const handleCandidateClick = () => {
    // Chuyển hướng đến trang chi tiết ứng viên
    navigate(`/candidate/${candidate.candidate._id}`);
  };

  const handleMessageClick = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt để không kích hoạt handleCandidateClick (nếu bạn bọc cả card)
    openChat(candidate.candidate._id, 'candidate');
  };

  return (
    <div className="flex-none w-48 p-4 bg-gray-700 rounded-lg shadow-md flex flex-col items-center justify-between">
      {/* Thêm onClick vào ảnh để tăng trải nghiệm người dùng */}
      <img
        src={candidate.candidate.isOpenToWork ? openToWorkAvatar : userAvatar}
        alt="Candidate Avatar"
        className="h-20 w-20 rounded-full object-cover mb-3 border-2 border-gray-600 cursor-pointer"
        onClick={handleCandidateClick}
      />
      
      {/* Sửa phần tên thành một liên kết có thể nhấn */}
      <p 
        className="text-white font-semibold text-center mb-3 truncate w-full cursor-pointer hover:text-blue-400 hover:underline transition-colors"
        onClick={handleCandidateClick}
      >
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