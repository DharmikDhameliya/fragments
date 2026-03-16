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
    // text/* types
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
    expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
    expect(Fragment.isSupportedType('text/markdown')).toBe(true);
    expect(Fragment.isSupportedType('text/html')).toBe(true);
    // JSON type
    expect(Fragment.isSupportedType('application/json')).toBe(true);
  });

  test('isSupportedType() should return false for unsupported types', () => {
    expect(Fragment.isSupportedType('application/pdf')).toBe(false);
    expect(Fragment.isSupportedType('image/png')).toBe(false);
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
    expect(() => new Fragment({ ownerId: 'abc', type: 'image/png' })).toThrow();
    expect(() => new Fragment({ ownerId: 'abc', type: 'application/pdf' })).toThrow();
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
});
