const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;
const userSockets = new Map();

function setupSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                if (!user) {
                    console.error('Socket Authentication error: User not found for token ID:', decoded.id);
                    return next(new Error('Authentication error: User not found'));
                }
                socket.user = user;
                next();
            } catch (err) {
                console.error('Socket Authentication error:', err.message);
                return next(new Error('Authentication error: Invalid token'));
            }
        } else {
            console.error('Socket Authentication error: No token provided');
            return next(new Error('Authentication error: No token provided'));
        }
    });

    io.on('connection', (socket) => {
        if (!socket.user) {
            console.error("Socket connected without user authentication. This shouldn't happen if middleware is correct.");
            socket.disconnect();
            return;
        }

        socket.join(socket.user.id.toString());
        userSockets.set(socket.user.id.toString(), socket.id);
        socket.broadcast.emit('userOnline', { userId: socket.user.id, isOnline: true, name: socket.user.name });

        socket.on('disconnect', () => {
            socket.leave(socket.user.id.toString());
            userSockets.delete(socket.user.id.toString());
            // Emit user offline event
            socket.broadcast.emit('userOffline', { userId: socket.user.id, isOnline: false, name: socket.user.name });
        });
 
        socket.on('typing', ({ receiverId, isTyping }) => {
            if (receiverId) {
                socket.to(receiverId).emit('userTyping', { senderId: socket.user.id, isTyping });
            }
        });
    });
}

// Middleware to attach io to req object for use in controllers
const attachIO = (req, res, next) => {
    if (io) {
        req.io = io;
    }
    next();
};

module.exports = { setupSocket, attachIO, getIO: () => io }; 