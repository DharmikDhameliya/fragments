// src/auth/http-auth.js

const basicAuth = require('basic-auth');
const fs = require('fs');
const path = require('path');

function authenticate() {
  return (req, res, next) => {
    const credentials = basicAuth(req);

    if (!credentials) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }

    const { name, pass } = credentials;
    const file = process.env.HTPASSWD_FILE || path.join(__dirname, '../../tests/.htpasswd');
    const data = fs.readFileSync(file, 'utf-8');
    const lines = data.split('\n');
    const userLine = lines.find((line) => line.startsWith(name + ':'));

    if (!userLine) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }

    const storedPassword = userLine.split(':')[1].trim();

    if (pass !== storedPassword) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }

    req.user = name;
    next();
  };
}

module.exports = { authenticate };
