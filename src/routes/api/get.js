// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragments = await Fragment.byUser(req.user);
    res.status(200).json({
      status: 'ok',
      fragments: fragments,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: { message: err.message, code: 500 },
    });
  }
};
