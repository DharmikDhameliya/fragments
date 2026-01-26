const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth');

// Import version and author from package.json
const { version, author } = require('../../package.json');
// Import our response helper
const { createSuccessResponse } = require('../response');

// Health check (no auth required)
router.get('/', (req, res) => {
  // Client should not cache this response
  res.setHeader('Cache-Control', 'no-cache');

  // Send a 200 'ok' response with author, githubUrl, and version
  res.status(200).json(
    createSuccessResponse({
      author,
      // Replace 'YourGitHubUsername' with your actual GitHub username
      githubUrl: 'https://github.com/DharmikDhameliya/fragments',
      version,
    })
  );
});

// All /v1 routes require authentication
router.use('/v1', authenticate(), require('./api'));

module.exports = router;
