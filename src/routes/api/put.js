// src/routes/api/put.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const fragment = await Fragment.byId(req.user, id);

    // 1. Check if the Content-Type matches the fragment's type
    const contentType = req.get('Content-Type');
    if (!fragment.type.includes(contentType)) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            `Content-Type mismatch: cannot update ${fragment.type} with ${contentType}`
          )
        );
    }

    // 2. Update the data - handle raw buffer for all types
    let data = req.body;
    if (!Buffer.isBuffer(data)) {
      data = Buffer.from(JSON.stringify(data));
    }

    await fragment.setData(data);

    // 3. Update fragment size metadata
    fragment.size = data.length;
    await fragment.save();

    logger.info({ id }, 'Fragment data updated successfully');

    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.warn({ err }, 'Failed to update fragment');
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
