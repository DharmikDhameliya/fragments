const crypto = require('crypto');

module.exports = (email) => {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};
