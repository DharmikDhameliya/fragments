const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('./auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize Passport for Cognito authentication
app.use(passport());

// Use our routes
app.use('/', require('./routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: { message: 'not found', code: 404 },
  });
});

module.exports = app;
