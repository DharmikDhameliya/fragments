const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  const authHeader = () =>
    `Basic ${Buffer.from('test-user1@fragments-testing.com:password1').toString('base64')}`;

  test('authenticated users can retrieve fragment metadata', async () => {
    // 1. Create a fragment first
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send('metadata test');

    const id = postRes.body.fragment.id;

    // 2. Get its info
    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .set('Authorization', authHeader());

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(id);
    expect(res.body.fragment).toHaveProperty('type', 'text/plain');
    expect(res.body.fragment).toHaveProperty('size', 13); // 'metadata test' is 13 bytes
  });

  test('returns 404 for non-existent fragment info', async () => {
    const res = await request(app)
      .get('/v1/fragments/no-such-id/info')
      .set('Authorization', authHeader());
    expect(res.statusCode).toBe(404);
  });
});
