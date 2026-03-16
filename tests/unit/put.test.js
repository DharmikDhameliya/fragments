const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  const authHeader = () =>
    `Basic ${Buffer.from('test-user1@fragments-testing.com:password1').toString('base64')}`;

  test('authenticated user can update fragment data', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send('old data');

    const id = postRes.body.fragment.id;

    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send('new data');

    expect(putRes.statusCode).toBe(200);

    const getRes = await request(app).get(`/v1/fragments/${id}`).set('Authorization', authHeader());

    expect(getRes.text).toBe('new data');
  });

  test('returns 400 if Content-Type does not match', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send('text');

    const id = postRes.body.fragment.id;

    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .set('Authorization', authHeader())
      .set('Content-Type', 'application/json')
      .send({ data: 'json' });

    expect(putRes.statusCode).toBe(400);
  });
});
