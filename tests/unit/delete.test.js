const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  const authHeader = () =>
    `Basic ${Buffer.from('test-user1@fragments-testing.com:password1').toString('base64')}`;

  test('authenticated user can delete a fragment', async () => {
    // Create a fragment first
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send('delete me');

    const id = postRes.body.fragment.id;

    // Delete it
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${id}`)
      .set('Authorization', authHeader());

    expect(deleteRes.statusCode).toBe(200);

    // Confirm it's gone
    const getRes = await request(app).get(`/v1/fragments/${id}`).set('Authorization', authHeader());

    expect(getRes.statusCode).toBe(404);
  });

  test('returns 404 when deleting a non-existent fragment', async () => {
    const res = await request(app)
      .delete('/v1/fragments/does-not-exist')
      .set('Authorization', authHeader());

    expect(res.statusCode).toBe(404);
  });

  test('unauthenticated requests are denied', async () => {
    const res = await request(app).delete('/v1/fragments/some-id');
    expect(res.statusCode).toBe(401);
  });
});
