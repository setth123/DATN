import axios from "axios";

const API_URL = "http://localhost:4000/api/auth";

// Interceptor để xử lý lỗi 401 (Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra nếu lỗi là 401 và không phải từ các trang login/register
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.endsWith("/login") &&
      !error.config.url.endsWith("/register") &&
      !error.config.url.endsWith("/google")
    ) {
      logout(); // Gọi hàm logout
      window.location.href = "/signin"; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

const register = (email, password) => {
  return axios.post(API_URL + "/register", {
    email,
    password,
  });
};

const login = (email, password) => {
  return axios
    .post(API_URL + "/login", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.data && response.data.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        window.dispatchEvent(new Event("authChange")); // Thông báo cho các component khác về sự thay đổi trạng thái đăng nhập
      }
      return response.data;
    });
};

const googleLogin = (googleData) => {
  return axios
    .post(API_URL + "/google", {
      token: googleData.credential,
    })
    .then((response) => {
      if (response.data.data && response.data.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        window.dispatchEvent(new Event("authChange")); // Thông báo cho các component khác
      }
      return response.data;
    });
    
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("company");
  localStorage.removeItem("candidate");
  localStorage.removeItem("candidateProfile");
  localStorage.removeItem("ai_conversation_id");
  window.dispatchEvent(new Event("authChange")); // Thông báo cho các component khác về việc đã đăng xuất
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};
const getCurrentCompany=()=>{
  return JSON.parse(localStorage.getItem("company"));
}
const getCurrentCandidate=()=>{
  return JSON.parse(localStorage.getItem("candidate"));
}
const authService = {
  register,
  login,
  googleLogin,
  logout,
  getCurrentUser,
  getCurrentCompany,
  getCurrentCandidate
};

export default authService;
