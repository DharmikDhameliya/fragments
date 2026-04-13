// src/routes/index.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth');

// Import version and author from package.json
const { version, author } = require('../../package.json');
// Import our response helper
const { createSuccessResponse } = require('../response');

/**
 * Public Health Check Routes
 * These must stay ABOVE the authenticate() middleware
 */

// Root health check
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/DharmikDhameliya/fragments',
      version,
    })
  );
});

// Explicit v1 health check (Public)
router.get('/v1/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      status: 'ok',
      version,
    })
  );
});

/**
 * Authenticated Routes
 */

console.log('SETTING UP /v1 ROUTES WITH AUTH');
const authMiddleware = authenticate();

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
