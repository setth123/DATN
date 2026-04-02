import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/conversations';

const getOrCreateConversation = (userId,targetUserId) => {
    return axios.post(API_URL, { userId, targetUserId }, { headers: authHeader() });
};

export default {
    getOrCreateConversation,
};
