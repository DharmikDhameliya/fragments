// src/auth/http-auth.js

const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');

function strategy() {
  passport.use(
    new BasicStrategy((username, password, done) => {
      const file = process.env.HTPASSWD_FILE || path.join(__dirname, '../../tests/.htpasswd');
      const data = fs.readFileSync(file, 'utf-8');
      const lines = data.split('\n');
      const userLine = lines.find((line) => line.startsWith(username + ':'));

      if (!userLine) return done(null, false);

      const storedPassword = userLine.split(':')[1].trim();
      if (password !== storedPassword) return done(null, false);

      return done(null, username);
    })
  );
  return passport.initialize();
}

function authenticate() {
  return (req, res, next) => {
    passport.authenticate('basic', { session: false }, (err, user) => {
      if (err || !user) {
        return res
          .status(401)
          .json({ status: 'error', error: { message: 'Unauthorized', code: 401 } });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
}

module.exports = { strategy, authenticate };
