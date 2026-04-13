// src/auth/index.js

// Use Cognito if pool ID is set, otherwise use HTTP Basic Auth
if (process.env.AWS_COGNITO_POOL_ID) {
  module.exports = require('./cognito');
} else {
  module.exports = require('./http-auth');
}
