import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import userAvatar from "../assets/user-avatar.svg";

const Header = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

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
          <Link
            to="/about"
            className="transition duration-300 hover:text-green-500"
          >
            Phỏng vấn AI
          </Link>
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