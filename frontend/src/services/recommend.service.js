import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/recommended';

const recommendCandidates = (jobId) => {
  return axios.get(`${API_URL}/candidates/${jobId}`, { headers: authHeader() });
};

const recommendJobs = () => {
    return axios.get(`${API_URL}/jobs/`, { headers: authHeader() });
}
const recommendCandidateForJob=(jobId)=>{
    return axios.get(`${API_URL}/companies/jobs/${jobId}`, { headers: authHeader() });
}

export default {
  recommendCandidates,
  recommendJobs,
  recommendCandidateForJob
};