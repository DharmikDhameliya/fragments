// tests/integration/get-id.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  // Helper to create a basic auth header
  const authHeader = () =>
    `Basic ${Buffer.from('test-user1@fragments-testing.com:test-password1').toString('base64')}`;

  test('can retrieve fragment data by id', async () => {
    const data = 'hello world';

    // 1. First create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send(data);

    expect(postRes.status).toBe(201);
    const id = postRes.body.fragment.id;

    // 2. Now retrieve it by ID
    const getRes = await request(app).get(`/v1/fragments/${id}`).set('Authorization', authHeader());

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe(data);
    expect(getRes.headers['content-type']).toMatch(/text\/plain/);
  });

  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist-12345')
      .set('Authorization', authHeader());

    expect(res.status).toBe(404);
  });

  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments/some-id');

    expect(res.status).toBe(401);
  });
});
