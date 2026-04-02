import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api/messages';

const getMessages = (conversationId, limit, before) => {
    return axios.get(API_URL, { 
        params: { conversationId, limit, before },
        headers: authHeader() 
    });
};

// const sendMessage = (conversationId, text) => {
//     return axios.post(API_URL, { conversationId, text }, { headers: authHeader() });
// };

const sendFile = (conversationId, file) => {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('file', file);

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
