import  express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authMiddleware } from "../middlewares/auth.middeware.js";

const router = express.Router();
// Get all notifications for the logged-in user
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark a specific notification as read
router.post('/:id/read', authMiddleware, notificationController.markNotificationAsRead);
// Mark all notifications as read
router.post('/read-all', authMiddleware, notificationController.markAllNotificationsAsRead);

export default router;
