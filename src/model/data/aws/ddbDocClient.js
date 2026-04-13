// src/model/data/aws/ddbDocClient.js

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    logger.debug('Using DynamoDB credentials from environment');
    return credentials;
  }

  return undefined;
};

const getDynamoDBEndpoint = () => {
  const endpoint = process.env.AWS_DYNAMODB_ENDPOINT || process.env.AWS_DYNAMODB_ENDPOINT_URL;

  if (endpoint) {
    logger.debug({ endpoint }, 'Using alternate DynamoDB endpoint');
    return endpoint;
  }

  return undefined;
};

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: getDynamoDBEndpoint(),
  credentials: getCredentials(),
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

module.exports = { ddbClient, ddbDocClient };
