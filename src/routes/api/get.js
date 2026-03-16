// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // If ?expand=1 is passed, return full metadata objects; otherwise return IDs only
    const expand = req.query.expand === '1';
    logger.debug({ expand }, 'GET /v1/fragments expand flag');

    const fragments = await Fragment.byUser(req.user, expand);

    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    logger.error({ err }, 'Error in GET /fragments');
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
