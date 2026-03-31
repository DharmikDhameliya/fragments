// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const contentType = req.get('Content-Type');

    // Validate the Content-Type is supported before doing anything else
    if (!Fragment.isSupportedType(contentType)) {
      return res.status(415).json({
        status: 'error',
        error: {
          message: 'Unsupported Media Type',
          code: 415,
        },
      });
    }

    // Normalize body: express.json() gives an object, express.raw() gives a Buffer
    // We always store data as a Buffer
    let data;
    if (Buffer.isBuffer(req.body)) {
      data = req.body;
    } else if (req.body !== undefined) {
      // JSON body — serialize back to a Buffer
      data = Buffer.from(JSON.stringify(req.body));
    } else {
      return res.status(400).json({
        status: 'error',
        error: { message: 'Request body is empty', code: 400 },
      });
    }

    // Create a new Fragment object
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: data.length,
    });

    // Save metadata and data
    await fragment.save();
    await fragment.setData(data);

    logger.info({ fragment }, 'Fragment created successfully');

    // Build the Location header URL using API_URL env var or fallback to request host
    const apiUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    res.location(`${apiUrl}/v1/fragments/${fragment.id}`);

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
