import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/messages';

const getMessages = (conversationId, limit, before,isAI) => {
    return axios.get(API_URL, { 
        params: { conversationId, limit, before,isAI },
        headers: authHeader() 
    });
};

// const sendMessage = (conversationId, text) => {
//     return axios.post(API_URL, { conversationId, text }, { headers: authHeader() });
// };

const sendFile = (conversationId, file, isAI) => {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('file', file);
    formData.append('isAI', isAI);

    return axios.post(`${API_URL}/file`, formData, {
        headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default {
    getMessages,
    sendFile,
};
