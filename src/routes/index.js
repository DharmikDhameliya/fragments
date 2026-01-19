const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth');

// Health check (no auth required)
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// All /v1 routes require authentication
router.use('/v1', authenticate(), require('./api'));

module.exports = router;
