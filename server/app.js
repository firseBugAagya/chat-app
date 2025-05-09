const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { attachIO } = require('./utils/socket');

require('dotenv').config();

const app = express();

const frontendURL = "http://localhost:3000" || "http://192.168.1.6:3000/";

const corsOptions = {
    origin: frontendURL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

connectDB();

app.use(express.json());

app.use(attachIO);

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// test if the server is up
app.get('/', (req, res) => {
    res.send('Chat App Backend Running!');
});

module.exports = app;