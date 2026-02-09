// src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');

module.exports = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({
          status: 'error',
          error: {
            message: 'Unauthorized',
            code: 401,
          },
        });
      }
      // Hash the user's email and put it on req.user
      req.user = hash(user);
      next();
    })(req, res, next);
  };
};
