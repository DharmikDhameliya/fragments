const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { ddbClient } = require('./ddbDocClient');
const s3Client = require('./s3Client');
const logger = require('../../../logger');

const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_NAME;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const isLocalEndpoint = (endpoint) =>
  !!endpoint && /(localhost|127\.0\.0\.1|localstack)/i.test(endpoint);

const shouldInitializeAwsResources = () =>
  process.env.NODE_ENV !== 'production' &&
  (isLocalEndpoint(process.env.AWS_DYNAMODB_ENDPOINT) ||
    isLocalEndpoint(process.env.AWS_DYNAMODB_ENDPOINT_URL) ||
    isLocalEndpoint(process.env.AWS_S3_ENDPOINT) ||
    isLocalEndpoint(process.env.AWS_S3_ENDPOINT_URL));

const ensureTableExists = async () => {
  if (!TABLE_NAME) {
    throw new Error('AWS_DYNAMODB_TABLE_NAME is not configured');
  }

  try {
    await ddbClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    logger.debug({ table: TABLE_NAME }, 'DynamoDB table already exists');
  } catch (err) {
    const notFound =
      err.name === 'ResourceNotFoundException' ||
      err.$metadata?.httpStatusCode === 400 ||
      err.Code === 'ResourceNotFoundException';

    if (!notFound) {
      throw err;
    }

    logger.info({ table: TABLE_NAME }, 'Creating local DynamoDB table');
    await ddbClient.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        AttributeDefinitions: [
          { AttributeName: 'ownerId', AttributeType: 'S' },
          { AttributeName: 'id', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'ownerId', KeyType: 'HASH' },
          { AttributeName: 'id', KeyType: 'RANGE' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      })
    );
    logger.info({ table: TABLE_NAME }, 'Local DynamoDB table created');
  }
};

const ensureBucketExists = async () => {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    logger.debug({ bucket: BUCKET_NAME }, 'S3 bucket already exists');
  } catch (err) {
    const notFound =
      err.name === 'NotFound' ||
      err.name === 'NoSuchBucket' ||
      err.$metadata?.httpStatusCode === 404 ||
      err.Code === 'NoSuchBucket';

    if (!notFound) {
      throw err;
    }

    logger.info({ bucket: BUCKET_NAME }, 'Creating local S3 bucket');
    const createBucketParams = { Bucket: BUCKET_NAME };
    if (AWS_REGION !== 'us-east-1') {
      createBucketParams.CreateBucketConfiguration = {
        LocationConstraint: AWS_REGION,
      };
    }

    await s3Client.send(new CreateBucketCommand(createBucketParams));
    logger.info({ bucket: BUCKET_NAME }, 'Local S3 bucket created');
  }
};

module.exports = async () => {
  if (!shouldInitializeAwsResources()) {
    logger.debug('Skipping local AWS resource initialization');
    return;
  }

  await ensureBucketExists();
  await ensureTableExists();
};
