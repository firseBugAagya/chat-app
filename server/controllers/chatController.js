const Message = require('../models/Message');
const User = require('../models/User');

const getContacts = async (req, res) => {
    try {
        // Ensure req.user.id exists from authMiddleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated." });
        }
        const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
        res.json(users);
    } catch (err) {
        console.error('Error fetching contacts:', err);
        res.status(500).json({ message: err.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: receiverId },
                { sender: receiverId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 }).populate('sender', 'name avatar _id');

        // Mark messages as read
        await Message.updateMany(
            { sender: receiverId, receiver: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: err.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        if (!receiverId || !content || typeof content !== 'string' || content.trim() === "") {
            return res.status(400).json({
                message: 'Both receiverId and valid content are required'
            });
        }

        // Ensure receiver exists (optional, but good practice)
        const receiverUser = await User.findById(receiverId);
        if (!receiverUser) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const message = new Message({
            sender: req.user.id,
            receiver: receiverId,
            content
        });

        const savedMessage = await message.save();
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('sender', 'name avatar _id')
            .populate('receiver', 'name avatar _id');

        if (req.io) {
            req.io.to(receiverId.toString()).emit('newMessage', populatedMessage);
            req.io.to(req.user.id.toString()).emit('newMessage', populatedMessage);
        } else {
            console.warn('Socket.IO (req.io) not available in sendMessage - message saved but not emitted in real-time.');
        }

        return res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('Message send error:', err);
        return res.status(500).json({
            message: 'Failed to send message',
            error: err.message
        });
    }
};

module.exports = { getContacts, getMessages, sendMessage };