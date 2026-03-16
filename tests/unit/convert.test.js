const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id conversion', () => {
  const authHeader = () =>
    `Basic ${Buffer.from('test-user1@fragments-testing.com:password1').toString('base64')}`;

  test('can convert markdown to html via extension', async () => {
    // 1. Create a markdown fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/markdown')
      .send('# Hello World');

    const id = postRes.body.fragment.id;

    // 2. Request it as .html
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .set('Authorization', authHeader());

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('<h1>Hello World</h1>');
  });

  test('can convert markdown to plain text via extension', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/markdown')
      .send('# Hello');

    const id = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .set('Authorization', authHeader());

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toContain('text/plain');
    expect(res.text).toBe('# Hello');
  });

  test('returns 415 for unsupported conversion extension', async () => {
    // Use text/plain because we know POSTing this works
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader())
      .set('Content-Type', 'text/plain')
      .send('hello');

    const id = postRes.body.fragment.id;

    // text/plain cannot be converted to .json in our logic, so this should return 415
    const res = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .set('Authorization', authHeader());

    expect(res.statusCode).toBe(415);
  });
});
