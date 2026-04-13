// src/app.js

console.log('STARTING APP.JS');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

const auth = require('./auth');
const { createErrorResponse } = require('./response');

const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Use our auth strategy (Cognito in prod, Basic Auth in tests/dev)
// app.use(auth.strategy()); // Removed global auth - applied at route level

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`REQUEST: ${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(`RESPONSE: ${req.method} ${req.url} - ${res.statusCode}`);
  });
  next();
});

// Parse raw text bodies for any text/* fragment type (e.g., text/plain, text/markdown, text/html)
app.use(
  express.raw({ type: ['text/*', 'image/*', 'application/octet-stream', 'application/json'] })
);

// Define our routes
console.log('MOUNTING ROUTES');
app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;
