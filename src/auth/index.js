const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwksRsa = require('jwks-rsa');

module.exports = () => {
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

  passport.use(
    new Strategy(opts, (payload, done) => {
      // This payload contains the user's info from the token
      return done(null, payload);
    })
  );

  return passport.initialize();
};

module.exports.authenticate = () => passport.authenticate('jwt', { session: false });
