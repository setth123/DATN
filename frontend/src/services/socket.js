import io from 'socket.io-client';
import authService from './auth.service';

const SOCKET_URL = 'http://localhost:4000';

let socket;

export const initSocket = () => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
        socket = io(SOCKET_URL, {
            auth: {
                token: user.token
            }
        });

        socket.on('connect', () => {
            console.log('Socket connected');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
        
        return socket;
    }
    return null;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};
