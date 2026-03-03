// src/routes/api/get-by-id-info.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.info({ id: req.params.id }, 'Retrieved fragment metadata');

    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.warn({ err }, 'Fragment not found');
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
