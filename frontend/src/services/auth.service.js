import axios from "axios";

// ĐỔI Ở ĐÂY: Sử dụng đường dẫn tương đối (Relative URL) nếu Front-end và Nginx chạy cùng Domain/IP.
// Hoặc nếu Front-end ở local khác hoàn toàn, hãy đổi thành "http://localhost/api/auth" (port 80 của Nginx)
const API_URL = "/api/auth"; 

// Tạo một instance riêng của axios để tránh gây ảnh hưởng đến các request global khác (Best Practice)
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor để xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra nếu lỗi là 401 và không phải từ các trang login/register/google
    // Dùng .includes() hoặc kiểm tra URL sẽ an toàn hơn khi đổi sang đường dẫn tương đối
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes("/login") &&
      !error.config.url.includes("/register") &&
      !error.config.url.includes("/google")
    ) {
      logout(); // Gọi hàm logout
      window.location.href = "/signin"; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

const register = (email, password) => {
  // Đổi từ axios.post thành api.post để áp dụng interceptor và baseUrl mới
  return api.post("/register", {
    email,
    password,
  });
};

const login = (email, password) => {
  return api
    .post("/login", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.data && response.data.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        window.dispatchEvent(new Event("authChange")); 
      }
      return response.data;
    });
};

const googleLogin = (googleData) => {
  return api
    .post("/google", {
      token: googleData.credential,
    })
    .then((response) => {
      if (response.data.data && response.data.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        window.dispatchEvent(new Event("authChange")); 
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
  window.dispatchEvent(new Event("authChange")); 
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};
const getCurrentCompany = () => {
  return JSON.parse(localStorage.getItem("company"));
};
const getCurrentCandidate = () => {
  return JSON.parse(localStorage.getItem("candidate"));
};

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