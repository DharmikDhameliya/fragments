const request = require('supertest');
const app = require('../../src/app');

describe('DEBUG basic auth', () => {
  const authHeader = (user, pass) => `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;

  test('try test-user1@fragments-testing.com with password1', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .set('Authorization', authHeader('test-user1@fragments-testing.com', 'password1'));

    console.log('DEBUG status for password1:', res.status, res.body);
    expect([200, 401]).toContain(res.status); // don't fail the test, just log
  });

  test('try test-user1@fragments-testing.com with test-password1', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .set('Authorization', authHeader('test-user1@fragments-testing.com', 'test-password1'));

    console.log('DEBUG status for test-password1:', res.status, res.body);
    expect([200, 401]).toContain(res.status); // don't fail the test, just log
  });
});
