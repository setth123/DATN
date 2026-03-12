import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/jobs';

const createJob = (data) => {
  return axios.post(API_URL, data, { headers: authHeader() });
};

const getJobsByCompany = (companyId) => {
    return axios.get(API_URL + `/company/${companyId}`, { headers: authHeader() });
};

const getJobById = (id) => {
    return axios.get(API_URL + `/${id}`, { headers: authHeader() });
};

const getApplicationsForJob = (id) => {
  return axios.get(`${API_URL}/${id}/applications`, { headers: authHeader() });
};


export default {
  createJob,
  getJobsByCompany,
  getJobById,
  getApplicationsForJob
};
