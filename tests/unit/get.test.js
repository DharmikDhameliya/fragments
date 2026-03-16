// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // Helper to create a basic auth header
  // MUST match tests/.htpasswd: test-user1@fragments-testing.com:password1
  const authHeader = () =>
    `Basic ${Buffer.from('test-user1@fragments-testing.com:password1').toString('base64')}`;

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

  // 4. expand=1 returns full metadata objects
  test('authenticated users get expanded fragment metadata with ?expand=1', async () => {
    // First create a fragment so we have something to expand
    await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello world'));

    const res = await request(app).get('/v1/fragments?expand=1').set('Authorization', authHeader());

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);

    // Each item should be a full metadata object, not just a string ID
    if (res.body.fragments.length > 0) {
      const fragment = res.body.fragments[0];
      expect(fragment).toHaveProperty('id');
      expect(fragment).toHaveProperty('ownerId');
      expect(fragment).toHaveProperty('type');
      expect(fragment).toHaveProperty('size');
      expect(fragment).toHaveProperty('created');
      expect(fragment).toHaveProperty('updated');
    }
  });

  // 5. Without expand, returns array of ID strings
  test('without expand, returns array of ID strings', async () => {
    // First create a fragment
    await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello'));

    const res = await request(app).get('/v1/fragments').set('Authorization', authHeader());

    expect(res.statusCode).toBe(200);
    // Each item should be a string (ID), not an object
    res.body.fragments.forEach((item) => expect(typeof item).toBe('string'));
  });
});
