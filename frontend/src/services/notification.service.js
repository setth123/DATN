import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:4000/api' + '/notifications';

const getNotifications = () => {
  return axios.get(API_URL+'/', { headers: authHeader() });
};

const markAsRead = (notificationId) => {
  return axios.post(`${API_URL}/${notificationId}/read`, {}, { headers: authHeader() });
};

const markAllAsRead = () => {
  return axios.post(`${API_URL}/read-all`, {}, { headers: authHeader() });
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
