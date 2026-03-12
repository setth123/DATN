import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:4000/api/candidates";

const getMe = () => {
  return axios.get(API_URL + "/me", { headers: authHeader() });
};

const createOrEdit = (data) => {
  return axios.post(API_URL, data, { headers: authHeader() });
};

const candidateService = {
  getMe,
  createOrEdit,
};


export default candidateService;