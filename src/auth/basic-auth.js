// src/auth/basic-auth.js

const auth = require('http-auth');
const passport = require('passport');
const authPassport = require('http-auth-passport');
const path = require('path');
const logger = require('../logger');
const authorize = require('./auth-middleware');

// Make sure the env var exists
if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

logger.info('Using HTTP Basic Auth for auth');

// FIX: convert relative path → absolute path
const htpasswdPath = path.resolve(process.cwd(), process.env.HTPASSWD_FILE);

const basicAuth = auth.basic({
  file: htpasswdPath,
});

module.exports.strategy = () => {
  passport.use(authPassport(basicAuth));
  return passport.initialize();
};

// Updated to use the authorize middleware
module.exports.authenticate = () => authorize('http');
