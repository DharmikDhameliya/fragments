require('dotenv').config();

const app = require('./app');
const logger = require('./logger');
const ensureAwsResources = require('./model/data/aws/init');

const port = process.env.PORT || 8080;

(async () => {
  try {
    await ensureAwsResources();
    app.listen(port, () => {
      logger.info(`Server started on port ${port}`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to initialize required AWS resources');
    process.exit(1);
  }
})();
