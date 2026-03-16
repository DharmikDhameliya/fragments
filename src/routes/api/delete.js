const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the fragment exists first (throws if not found)
    await Fragment.byId(req.user, id);

    // Delete both metadata and data
    await Fragment.delete(req.user, id);

    logger.info({ id }, 'Fragment deleted successfully');
    return res.status(200).json(createSuccessResponse({ id }));
  } catch (err) {
    logger.warn({ err }, 'Failed to delete fragment');
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
