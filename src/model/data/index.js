// src/model/data/index.js

const logger = require('../../logger');

// If the environment sets an AWS Region, we'll use AWS storage
// services (S3, DynamoDB); otherwise, we'll use an in-memory db.
module.exports = (() => {
  if (process.env.AWS_REGION && process.env.NODE_ENV !== 'test') {
    logger.info('Using AWS storage');
    return require('./aws');
  }
  logger.warn('No AWS_REGION set. Using MemoryDB');
  return require('./memory');
})();
