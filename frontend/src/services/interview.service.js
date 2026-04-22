import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/interview/initiate';
const initiate = (formData) => {
  return axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const interviewService = {
  initiate,
};

export default interviewService;
