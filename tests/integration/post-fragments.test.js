const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // Helper to create a basic auth header
  // MUST match tests/.htpasswd: test-user1@fragments-testing.com:password1
  const authHeader = () =>
    `Basic ${Buffer.from('test-user1@fragments-testing.com:password1').toString('base64')}`;

  test('authenticated users can create a text fragment', async () => {
    const data = 'Hello Fragments!';
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send(data);

    expect(res.status).toBe(201);
    expect(res.headers.location).toBeDefined();
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(data.length);
  });

  test('unauthenticated requests should return 401', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('no auth');

    expect(res.status).toBe(401);
  });

  test('unsupported content types should return 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'application/json')
      .send({ data: 'not allowed' });

    expect(res.status).toBe(415);
  });
});
