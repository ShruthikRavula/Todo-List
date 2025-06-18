const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const todoRoutes = require('./routes/todoRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // Allow specific origin or all

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

// Simple route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware (should be last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Show stack in dev only
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});