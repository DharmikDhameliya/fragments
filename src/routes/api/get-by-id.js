// src/routes/api/get-by-id.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const data = await fragment.getData();

    logger.info({ id: req.params.id }, 'Retrieved fragment data');

    // Set the correct Content-Type header so the browser/client knows what it is
    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(data);
  } catch (err) {
    logger.warn({ err }, 'Fragment not found');
    res.status(404).json({
      status: 'error',
      error: { message: err.message, code: 404 },
    });
  }
};
