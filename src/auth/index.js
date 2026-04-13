// src/auth/index.js

const fs = require('fs');

console.log('Loading AUTH system...');
console.log('AWS_COGNITO_POOL_ID:', process.env.AWS_COGNITO_POOL_ID);
console.log('AWS_COGNITO_CLIENT_ID:', process.env.AWS_COGNITO_CLIENT_ID);
console.log('HTPASSWD_FILE:', process.env.HTPASSWD_FILE);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log(
  'hasCognito:',
  !!process.env.AWS_COGNITO_POOL_ID && !!process.env.AWS_COGNITO_CLIENT_ID
);
console.log(
  'hasHtpasswd:',
  !!process.env.HTPASSWD_FILE &&
    fs.existsSync(process.env.HTPASSWD_FILE) &&
    fs.statSync(process.env.HTPASSWD_FILE).isFile()
);

const hasCognito = !!process.env.AWS_COGNITO_POOL_ID && !!process.env.AWS_COGNITO_CLIENT_ID;

const hasHtpasswd =
  !!process.env.HTPASSWD_FILE &&
  fs.existsSync(process.env.HTPASSWD_FILE) &&
  fs.statSync(process.env.HTPASSWD_FILE).isFile();

// Don't allow both auth systems at once
if (hasCognito && hasHtpasswd) {
  throw new Error(
    'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
  );
}

// Prefer Amazon Cognito (production)
if (hasCognito) {
  module.exports = require('./cognito');
}
// Allow HTTP Basic Auth in non-production if a real .htpasswd file exists
else if (hasHtpasswd && process.env.NODE_ENV !== 'production') {
  console.log('LOADING BASIC AUTH MODULE');
  module.exports = require('./basic-auth');
}
// Fail fast if config is missing
else {
  throw new Error(
    'missing env vars: no authorization configuration found. Set AWS_COGNITO_POOL_ID/AWS_COGNITO_CLIENT_ID or provide a valid HTPASSWD_FILE.'
  );
}
