const path = require('path');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

const extToMime = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

module.exports = async (req, res) => {
  try {
    const rawId = req.params.id;
    const ext = path.extname(rawId);
    const id = ext ? rawId.slice(0, -ext.length) : rawId;

    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    if (!ext) {
      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
    }

    const targetType = extToMime[ext];
    if (!targetType) {
      return res.status(415).json(createErrorResponse(415, `unsupported extension: ${ext}`));
    }

    if (!fragment.formats.includes(targetType)) {
      return res
        .status(415)
        .json(createErrorResponse(415, `cannot convert ${fragment.mimeType} to ${targetType}`));
    }

    const { data: converted, mimeType } = await fragment.convertTo(data, targetType);
    logger.info({ id, ext, mimeType }, 'Fragment converted successfully');

    res.setHeader('Content-Type', mimeType);
    return res.status(200).send(converted);
  } catch (err) {
    logger.warn({ err }, 'Fragment not found or conversion failed');
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
