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

export default {
  getCompany,
  createOrUpdateCompany,
};
