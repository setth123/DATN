import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/conversations';

const getOrCreateConversation = (targetUserId) => {
    return axios.post(API_URL, { targetUserId }, { headers: authHeader() });
};
const createOrGetAI = () => {
    // Backend sẽ sử dụng userId từ token để xác định cuộc trò chuyện
    return axios.post(`${API_URL}/ai`, {}, { headers: authHeader() });
};
export default {
    getOrCreateConversation,
    createOrGetAI
};
