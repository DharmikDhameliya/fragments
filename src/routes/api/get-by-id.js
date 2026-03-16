const path = require('path');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

// Map file extensions to MIME types
const extToMime = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.json': 'application/json',
};

module.exports = async (req, res) => {
  try {
    // Extract optional extension, e.g. "abc123.html" -> id="abc123", ext=".html"
    const rawId = req.params.id;
    const ext = path.extname(rawId);
    const id = ext ? rawId.slice(0, -ext.length) : rawId;

    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    // No extension → return raw data with original content type
    if (!ext) {
      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
    }

    // Map extension to target MIME type
    const targetType = extToMime[ext];
    if (!targetType) {
      return res.status(415).json(createErrorResponse(415, `unsupported extension: ${ext}`));
    }

    // Check if this fragment supports conversion to the target type
    if (!fragment.formats.includes(targetType)) {
      return res
        .status(415)
        .json(createErrorResponse(415, `cannot convert ${fragment.mimeType} to ${targetType}`));
    }

    const { data: converted, mimeType } = fragment.convertTo(data, targetType);
    logger.info({ id, ext, mimeType }, 'Fragment converted successfully');

    res.setHeader('Content-Type', mimeType);
    return res.status(200).send(converted);
  } catch (err) {
    logger.warn({ err }, 'Fragment not found or conversion failed');
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
