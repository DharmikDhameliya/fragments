// src/auth/index.js

const basicAuth = require('basic-auth');
const fs = require('fs');
const path = require('path');

function authenticate() {
  return (req, res, next) => {
    const credentials = basicAuth(req);

    // 1. No credentials
    if (!credentials) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }

    const { name, pass } = credentials;

    // 2. Read .htpasswd
    const file = process.env.HTPASSWD_FILE || path.join(__dirname, '../../tests/.htpasswd');
    const data = fs.readFileSync(file, 'utf-8');

    const lines = data.split('\n');

    // 3. Find user
    const userLine = lines.find((line) => line.startsWith(name + ':'));

    if (!userLine) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }

    const storedPassword = userLine.split(':')[1];

    // ✅ IMPORTANT: For this assignment, passwords are plain text (NOT bcrypt)
    if (pass !== storedPassword) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }

    // ✅ success
    req.user = name;
    next();
  };
}

module.exports = {
  authenticate,
};
