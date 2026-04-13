const { Fragment } = require('../../src/model/fragment');

describe('Fragment Class', () => {
  test('constructor should create a valid fragment object', () => {
    const fragment = new Fragment({
      ownerId: 'abc',
      type: 'text/plain',
      size: 10,
    });
    expect(fragment.id).toBeDefined();
    expect(fragment.ownerId).toBe('abc');
    expect(fragment.type).toBe('text/plain');
    expect(fragment.size).toBe(10);
    expect(fragment.created).toBeDefined();
    expect(fragment.updated).toBeDefined();
  });

  test('constructor should throw if missing ownerId or type', () => {
    expect(() => new Fragment({ type: 'text/plain' })).toThrow();
    expect(() => new Fragment({ ownerId: 'abc' })).toThrow();
  });

  test('isSupportedType() should return true for supported types', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
    expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
    expect(Fragment.isSupportedType('text/markdown')).toBe(true);
    expect(Fragment.isSupportedType('text/html')).toBe(true);
    expect(Fragment.isSupportedType('application/json')).toBe(true);
    // Image types
    expect(Fragment.isSupportedType('image/png')).toBe(true);
    expect(Fragment.isSupportedType('image/jpeg')).toBe(true);
    expect(Fragment.isSupportedType('image/webp')).toBe(true);
    expect(Fragment.isSupportedType('image/gif')).toBe(true);
    expect(Fragment.isSupportedType('image/avif')).toBe(true);
  });

  test('isSupportedType() should return false for unsupported types', () => {
    expect(Fragment.isSupportedType('application/pdf')).toBe(false);
    expect(Fragment.isSupportedType('video/mp4')).toBe(false);
    expect(Fragment.isSupportedType('invalid-type')).toBe(false);
  });

  test('getters (mimeType, isText) should work correctly', () => {
    const fragment = new Fragment({
      ownerId: 'abc',
      type: 'text/plain; charset=utf-8',
    });
    expect(fragment.mimeType).toBe('text/plain');
    expect(fragment.isText).toBe(true);
  });

  test('constructor should throw for unsupported type', () => {
    expect(() => new Fragment({ ownerId: 'abc', type: 'application/pdf' })).toThrow();
    expect(() => new Fragment({ ownerId: 'abc', type: 'video/mp4' })).toThrow();
  });

  test('constructor should accept image types', () => {
    expect(() => new Fragment({ ownerId: 'abc', type: 'image/png' })).not.toThrow();
    expect(() => new Fragment({ ownerId: 'abc', type: 'image/jpeg' })).not.toThrow();
    expect(() => new Fragment({ ownerId: 'abc', type: 'image/webp' })).not.toThrow();
    expect(() => new Fragment({ ownerId: 'abc', type: 'image/gif' })).not.toThrow();
    expect(() => new Fragment({ ownerId: 'abc', type: 'image/avif' })).not.toThrow();
  });

  test('constructor should throw if size is negative', () => {
    expect(() => new Fragment({ ownerId: 'abc', type: 'text/plain', size: -1 })).toThrow();
  });

  test('constructor should throw if size is not a number', () => {
    expect(() => new Fragment({ ownerId: 'abc', type: 'text/plain', size: 'big' })).toThrow();
  });

  test('fragment id is auto-generated if not provided', () => {
    const fragment = new Fragment({ ownerId: 'abc', type: 'text/plain' });
    expect(typeof fragment.id).toBe('string');
    expect(fragment.id.length).toBeGreaterThan(0);
  });

  test('isText returns false for application/json', () => {
    const fragment = new Fragment({ ownerId: 'abc', type: 'application/json' });
    expect(fragment.isText).toBe(false);
  });

  test('isText returns false for image types', () => {
    const fragment = new Fragment({ ownerId: 'abc', type: 'image/png' });
    expect(fragment.isText).toBe(false);
  });

  test('formats returns correct conversions for image types', () => {
    const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
    const fragment = new Fragment({ ownerId: 'abc', type: 'image/png' });
    expect(fragment.formats).toEqual(imageTypes);
  });

  test('formats returns correct conversions for text types', () => {
    const md = new Fragment({ ownerId: 'abc', type: 'text/markdown' });
    expect(md.formats).toEqual(['text/markdown', 'text/html', 'text/plain']);

    const html = new Fragment({ ownerId: 'abc', type: 'text/html' });
    expect(html.formats).toEqual(['text/html', 'text/plain']);
  });

  test('convertTo returns same data for same type', async () => {
    const fragment = new Fragment({ ownerId: 'abc', type: 'text/plain' });
    const data = Buffer.from('hello');
    const result = await fragment.convertTo(data, 'text/plain');
    expect(result.mimeType).toBe('text/plain');
    expect(result.data.toString()).toBe('hello');
  });

  test('convertTo converts markdown to html', async () => {
    const fragment = new Fragment({ ownerId: 'abc', type: 'text/markdown' });
    const data = Buffer.from('# Hello');
    const result = await fragment.convertTo(data, 'text/html');
    expect(result.mimeType).toBe('text/html');
    expect(result.data.toString()).toContain('<h1>');
  });

  test('convertTo converts text types to text/plain', async () => {
    const fragment = new Fragment({ ownerId: 'abc', type: 'text/html' });
    const data = Buffer.from('<p>hello</p>');
    const result = await fragment.convertTo(data, 'text/plain');
    expect(result.mimeType).toBe('text/plain');
  });

  test('convertTo throws for unsupported conversion', async () => {
    const fragment = new Fragment({ ownerId: 'abc', type: 'text/plain' });
    const data = Buffer.from('hello');
    await expect(fragment.convertTo(data, 'application/json')).rejects.toThrow();
  });
});
