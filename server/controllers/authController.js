const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ name, email, password });
        await user.save();


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (err) {

        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        user.isOnline = true;
        await user.save();

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, isOnline: user.isOnline } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login, logout };