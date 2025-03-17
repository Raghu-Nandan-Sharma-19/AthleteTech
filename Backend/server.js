require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});