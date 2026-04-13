// src/routes/index.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth');

// Import version and author from package.json
const { version, author } = require('../../package.json');
// Import our response helper
const { createSuccessResponse } = require('../response');

// Health check (no auth required)
router.get('/', (req, res) => {
  console.log('HEALTH CHECK REQUEST');
  // Client should not cache this response
  res.setHeader('Cache-Control', 'no-cache');

  // Send a 200 'ok' response with author, githubUrl, and version
  res.status(200).json(
    createSuccessResponse({
      author,
      // Replace 'DharmikDhameliya' with your actual GitHub username if different
      githubUrl: 'https://github.com/DharmikDhameliya/fragments',
      version,
    })
  );
});

// All /v1 routes require authentication
console.log('SETTING UP /v1 ROUTES WITH AUTH');
const authMiddleware = authenticate();
console.log('AUTH MIDDLEWARE:', typeof authMiddleware);
router.use(
  '/v1',
  (req, res, next) => {
    console.log('/v1 REQUEST:', req.method, req.url);
    next();
  },
  authMiddleware,
  require('./api')
);

module.exports = router;
