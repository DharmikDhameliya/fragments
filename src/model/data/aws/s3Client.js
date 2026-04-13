// src/model/data/aws/s3Client.js

const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    logger.debug('Using extra S3 Credentials AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    return credentials;
  }

  return undefined;
};

const getS3Endpoint = () => {
  const endpoint = process.env.AWS_S3_ENDPOINT || process.env.AWS_S3_ENDPOINT_URL;

  if (endpoint) {
    logger.debug({ endpoint }, 'Using alternate S3 endpoint');
    return endpoint;
  }

  return undefined;
};

module.exports = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: getCredentials(),
  endpoint: getS3Endpoint(),
  forcePathStyle: true,
});
