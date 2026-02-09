// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // Helper to create a basic auth header
  const authHeader = () =>
    `Basic ${Buffer.from('test-user1@fragments-testing.com:test-password1').toString('base64')}`;
  // 1. Unauthenticated request → 401
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // 2. Wrong username/password → 401
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('wronguser@example.com', 'badpassword').expect(401));

  // 3. Valid credentials → 200 and returns array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').set('Authorization', authHeader());

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
});
