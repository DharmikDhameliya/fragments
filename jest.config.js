// jest.config.js

const path = require('path');
const envFile = path.join(__dirname, 'env.jest');

// Read the environment variables from our env.jest file
require('dotenv').config({ path: envFile });

console.log(
  `Using FRAGMENTS_LOG_LEVEL=${process.env.FRAGMENTS_LOG_LEVEL}. Use 'debug' in env.jest for more detail`
);

module.exports = {
  verbose: true,
  testTimeout: 5000,
  // Fail if we don't meet 80% line coverage
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
