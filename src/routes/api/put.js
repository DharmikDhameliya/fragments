const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const fragment = await Fragment.byId(req.user, id);

    // 1. Check if the Content-Type matches the fragment's type
    // We use fragment.type (which might have charset) or fragment.mimeType
    if (req.get('Content-Type') !== fragment.type) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            `Content-Type mismatch: cannot update ${fragment.type} with ${req.get('Content-Type')}`
          )
        );
    }

    // 2. Update the data
    // If it's JSON, we need to stringify it back to a buffer (similar to POST)
    let data = req.body;
    if (fragment.type === 'application/json' && !Buffer.isBuffer(data)) {
      data = Buffer.from(JSON.stringify(data));
    }

    await fragment.setData(data);
    logger.info({ id }, 'Fragment data updated successfully');

    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.warn({ err }, 'Failed to update fragment');
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
