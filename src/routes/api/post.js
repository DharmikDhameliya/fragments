// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // If the body is empty or not a Buffer, the raw parser failed
    if (!Buffer.isBuffer(req.body)) {
      return res.status(415).json({
        status: 'error',
        error: {
          message: 'Unsupported Media Type',
          code: 415,
        },
      });
    }

    // Create a new Fragment object
    const fragment = new Fragment({
      ownerId: req.user,
      type: req.get('Content-Type'),
      size: req.body.length,
    });

    // Save metadata and data
    await fragment.save();
    await fragment.setData(req.body);

    logger.info({ fragment }, 'Fragment created successfully');

    // Build the Location header URL
    const api_url = process.env.API_URL || `http://${req.headers.host}`;
    res.location(`${api_url}/v1/fragments/${fragment.id}`);

    // Respond with 201 Created
    res.status(201).json({
      status: 'ok',
      fragment: fragment,
    });
  } catch (err) {
    logger.error({ err }, 'Error in POST /fragments');
    res.status(500).json({
      status: 'error',
      error: {
        message: err.message,
        code: 500,
      },
    });
  }
};
