const app = require('./app');
const http = require('http');
const { setupSocket } = require('./utils/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});