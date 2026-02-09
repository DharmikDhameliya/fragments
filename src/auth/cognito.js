// src/auth/cognito.js

const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwksRsa = require('jwks-rsa');
const logger = require('../logger');
const authorize = require('./auth-middleware');

// Validate required env vars
if (
  !(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID && process.env.AWS_REGION)
) {
  throw new Error(
    'missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID, AWS_REGION'
  );
}

logger.info('Using AWS Cognito for auth');

// Configure JWT verification
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKeyProvider: jwksRsa.passportJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}/.well-known/jwks.json`,
  }),
  issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}`,
  algorithms: ['RS256'],
};

// Export a strategy() function that initializes passport
module.exports.strategy = () => {
  passport.use(
    new Strategy(opts, (payload, done) => {
      // Return the email from the JWT payload
      return done(null, payload.email);
    })
  );
  return passport.initialize();
};

// Updated to use the authorize middleware
module.exports.authenticate = () => authorize('jwt');
