import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import userAvatar from "../assets/user-avatar.svg";
import NotificationBell from "./NotificationBell";
import { useChat } from "../ChatContext";
import { useInterview } from "../InterviewContext";

const Header = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { openInterviewWidget } = useInterview();
  const {openChat} = useChat();
  useEffect(() => {
    const handleAuthChange = () => {
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        console.log(user);
      } else {
        setCurrentUser(undefined); // Xóa người dùng nếu đã đăng xuất
      }
    }

    handleAuthChange(); // Kiểm tra ban đầu khi component mount

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange); // Dọn dẹp listener khi component unmount
  }, []); // Dependency array rỗng vì chúng ta sử dụng event listener để cập nhật

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(undefined);
    navigate("/");
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="text-2xl font-bold text-green-500">
          <Link to="/">Jobeasy</Link>
        </div>
        <nav className="hidden items-center space-x-6 md:flex">
          <Link to="/" className="transition duration-300 hover:text-green-500">
            Trang chủ
          </Link>
          <Link
            to="/jobs"
            className="transition duration-300 hover:text-green-500"
          >
            Việc làm
          </Link>
          {currentUser && (
            <div
              className="relative"
              onMouseEnter={() => setIsAiMenuOpen(true)}
              onMouseLeave={() => setIsAiMenuOpen(false)}
            >
              <button className="transition duration-300 hover:text-green-500">
                Trợ lý ảo
              </button>
              {isAiMenuOpen && (
                <div className="absolute left-1/2 top-full z-20 w-48 -translate-x-1/2 rounded-md bg-gray-700 shadow-lg pt-2">
                  <ul className="py-1">
                    <li>
                      <button
                        className="block w-full px-4 py-2 text-left text-sm text-white transition duration-300 hover:text-green-500"
                        onClick={() => {
                          openInterviewWidget();
                          setIsAiMenuOpen(false);
                        }}
                      >
                        Phỏng vấn AI
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          openChat(null, "AI Assistant", "AI");
                          setIsAiMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-white transition duration-300 hover:text-green-500"
                      >
                        Chat với trợ lý ảo
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
          <Link
            to="/company/me"
            className="transition duration-300 hover:text-green-500"
          >
            Đăng Tuyển
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <NotificationBell />
              <Link to="/me" className="flex items-center space-x-2">
                <img src={userAvatar} alt="User Avatar" className="h-8 w-8 rounded-full" />
                <span className="font-bold">{`Welcome, ${currentUser.user.email.split('@')[0]}`}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-green-700"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-gray-700 px-4 py-2 font-bold text-white transition duration-300 hover:bg-gray-600"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;