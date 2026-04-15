import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import userAvatar from "../assets/user-avatar.svg";
import NotificationBell from "./NotificationBell";
import { useChat } from "../ChatContext";

const Header = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const navigate = useNavigate();
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
        <nav className="hidden space-x-6 md:flex">
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
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openChat(null, "AI Assistant", "AI");
              }}
              className="transition duration-300 hover:text-green-500"
            >
              Trợ lý ảo
            </a>
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