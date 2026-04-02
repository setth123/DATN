import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notification.service';
import { getSocket } from '../services/socket';
import { useChat } from '../ChatContext';
import BellIcon from '../assets/notification.svg';
import UserAvatar from '../assets/user-avatar.svg';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const {openChat}=useChat();
  useEffect(() => {
    // Fetch initial notifications
    notificationService.getNotifications().then((response) => {
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.isRead).length);
    });
    const socket=getSocket();
    // Listen for new notifications
    socket.on('new_notification', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Handle clicks outside of the component
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      socket.off('new_notification');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen && unreadCount > 0) {
      // Mark all as read when closing
      // notificationService.markAllAsRead().then(() => {
      //   setUnreadCount(0);
      //   setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // });
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      notificationService.markAsRead(notification._id).then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => prev - 1);
      });
    }

    setIsOpen(false);

    // Navigate or open chat
    if (notification.type === 'NEW_APPLICATION') {
      navigate(`/candidate/${notification.from._id}`);
    } else if (notification.type === 'NEW_MESSAGE') {
      // We need conversationId to open the chat.
      // This part requires that the backend notification includes conversationId for NEW_MESSAGE type.
      // Assuming notification.data.conversationId exists.
      // This is a placeholder, as the backend doesn't provide this yet.
      // A robust solution would be to find or create a conversation between the two users.
      // For now, we can't open the chat directly without more info.
      // We will just open the chat widget.
      //console.log(notification.from._id+" "+notification.displayName);
      openChat(notification.from._id, notification.displayName  ,'candidate');
    }
  };

  const renderNotificationText = (notification) => {
    const displayName=notification.displayName || 'Người dùng';
    if (notification.type === 'NEW_APPLICATION') {
      
      return `Ứng viên <strong>${displayName}</strong> vừa ứng tuyển vị trí <strong>${notification.jobTitle}</strong>.`;
    }
    if (notification.type === 'NEW_MESSAGE') {
      console.log(notification.type);
      return `<strong>${displayName}</strong> vừa nhắn tin cho bạn.`;
    }
    return 'Bạn có thông báo mới.';
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button onClick={handleToggle} className="relative">
        <img src={BellIcon} alt="Notifications" className="w-8 h-8 mt-3" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
          <div className="p-4 font-bold border-b border-gray-700 text-white">Thông báo</div>
          {notifications.length > 0 ? (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                    !n.isRead ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <img
                      src={n.from?.profilePicture || UserAvatar}
                      alt="avatar"
                      className="w-8 h-8 mr-3 rounded-full"
                    />
                    <p 
                      className="text-sm text-gray-300"
                      dangerouslySetInnerHTML={{ __html: renderNotificationText(n) }}
                    ></p>
                  </div>
                  <p className="mt-1 text-xs text-right text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-gray-400">Không có thông báo nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
