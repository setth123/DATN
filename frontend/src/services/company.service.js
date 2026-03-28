import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/companies';

const getCompany = () => {
  return axios.get(API_URL+ '/me', { headers: authHeader() });
};

const createOrUpdateCompany = (data) => {
    const headers = authHeader();
    if (data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
    }
    return axios.post(API_URL, data, { headers: headers });
};

const getCompanyById = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
}
const getApplicationsForJob = (id) => {
  return axios.get(`${API_URL}/jobs/${id}/applications`, { headers: authHeader() });
};
const getMostJobComapny = () => {
  return axios.get(`${API_URL}/most-jobs`, { headers: authHeader() });
};

export default {
  getCompany,
  createOrUpdateCompany,
  getCompanyById,
  getApplicationsForJob,
  getMostJobComapny
};
