// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const contentType = req.get('Content-Type');

    if (!Fragment.isSupportedType(contentType)) {
      return res.status(415).json({
        status: 'error',
        error: {
          message: 'Unsupported Media Type',
          code: 415,
        },
      });
    }

    if (
      contentType === 'application/json' &&
      req.body &&
      typeof req.body === 'object' &&
      'data' in req.body
    ) {
      return res.status(415).json({
        status: 'error',
        error: {
          message: 'Invalid fragment: JSON must be raw data, not a wrapped object',
          code: 415,
        },
      });
    }

    let data;
    if (Buffer.isBuffer(req.body)) {
      data = req.body;
    } else if (req.body !== undefined) {
      data = Buffer.from(JSON.stringify(req.body));
    } else {
      return res.status(400).json({
        status: 'error',
        error: { message: 'Request body is empty', code: 400 },
      });
    }

    // ✅ FIX: ensure ownerId is a STRING
    const ownerId =
      typeof req.user === 'string' ? req.user : req.user?.id || JSON.stringify(req.user);

    const fragment = new Fragment({
      ownerId, // ✅ FIXED
      type: contentType,
      size: data.length,
    });

    await fragment.save();
    await fragment.setData(data);

    logger.info({ fragment }, 'Fragment created successfully');

    const apiUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    res.location(`${apiUrl}/v1/fragments/${fragment.id}`);

    res.status(201).json({
      status: 'ok',
      fragment: fragment,
    });
  } catch (err) {
    console.error('POST ERROR:', err); // ✅ extra debug
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
