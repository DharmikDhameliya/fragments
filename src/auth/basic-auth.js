// src/auth/basic-auth.js

const hash = require('../hash');

// Simple basic auth implementation for development
const users = {
  'test-user1@fragments-testing.com': 'password1',
  'test-user2@fragments-testing.com': 'test-password1',
};

module.exports.strategy = () => {
  console.log('BASIC AUTH STRATEGY CREATED');
  return (req, res, next) => {
    console.log('AUTH MIDDLEWARE CALLED FOR:', req.method, req.url);
    console.log('AUTH HEADER:', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      console.log('NO AUTH HEADER OR NOT BASIC');
      return res.status(401).json({
        status: 'error',
        error: { message: 'Unauthorized', code: 401 },
      });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    console.log('USERNAME:', username, 'PASSWORD:', password);

    if (users[username] && users[username] === password) {
      console.log('AUTH SUCCESS');
      req.user = hash(username);
      return next();
    }

    console.log('AUTH FAILED');
    return res.status(401).json({
      status: 'error',
      error: { message: 'Unauthorized', code: 401 },
    });
  };
};

// For compatibility with the existing code
module.exports.authenticate = () => module.exports.strategy();
