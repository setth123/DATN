import axios from "axios";

const API_URL = "http://localhost:4000/api/auth";

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
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const authService = {
  register,
  login,
  googleLogin,
  logout,
  getCurrentUser,
};

export default authService;
