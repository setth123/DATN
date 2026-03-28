import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:4000/api/";

const applyForJob = async (jobId, payload) => {
  // payload có thể là một đối tượng FormData (để upload file) hoặc một chuỗi (cho cvSnapshotUrl)
  let dataToSend;
  const headers = authHeader();

  if (payload instanceof FormData) {
    // Nếu payload là FormData, nghĩa là một CV mới đang được tải lên
    payload.append("jobId", jobId); // Thêm jobId vào FormData
    dataToSend = payload;
    // Axios sẽ tự động đặt Content-Type thành multipart/form-data khi gửi FormData
  } else {
    // Nếu payload là một chuỗi, đó là cvSnapshotUrl
    dataToSend = { jobId, cvSnapshotUrl: payload };
    headers["Content-Type"] = "application/json";
  }

  return axios.post(API_URL + "applications", dataToSend, { headers });
};

const getMyApplication=async()=>{
  return axios.get(API_URL + "applications/my", { headers: authHeader() });
}
const cancelApply=async(jobId)=>{
  return axios.delete(API_URL + `applications/${jobId}`, { headers: authHeader() }); 
}
const applicationService = { applyForJob, getMyApplication, cancelApply };

export default applicationService;
