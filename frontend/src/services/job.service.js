import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/jobs';

const createOrUpdateJob = (data) => {
  return axios.post(API_URL, data, { headers: authHeader() });
};
const deleteJob=(id)=>{
  return axios.delete(API_URL+`/${id}`,{ headers: authHeader() });
}
const getJobsByCompany = (companyId) => {
    return axios.get(API_URL + `/company/${companyId}`, { headers: authHeader() });
};

const getJobById = (id) => {
    return axios.get(API_URL + `/${id}`, { headers: authHeader() });
};
const getJobs=(query)=>{
  return axios.get(API_URL,{ params: query, headers: authHeader() });
}


export default {
  createOrUpdateJob,
  getJobsByCompany,
  getJobById,
  deleteJob,
  getJobs
};
