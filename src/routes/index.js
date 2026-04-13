// src/routes/index.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth');
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');

/**
 * Public Routes (No Auth Required)
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

// v1 health check (Public to allow ALB/Demo health checks)
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
 * Protected Routes (/v1)
 */
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
