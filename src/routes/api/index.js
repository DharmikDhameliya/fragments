// src/routes/api/index.js
const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

// GET /v1/fragments - List all fragment IDs for the authenticated user
router.get('/fragments', require('./get'));

// POST /v1/fragments - Create a new fragment
router.post('/fragments', rawBody(), require('./post'));

// GET /v1/fragments/:id - Get a specific fragment's data by ID
router.get('/fragments/:id', require('./get-by-id'));

module.exports = router;
