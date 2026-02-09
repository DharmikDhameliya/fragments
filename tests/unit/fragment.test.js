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

  test('isSupportedType() should return true for text/plain', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
    expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
  });

  test('isSupportedType() should return false for unsupported types', () => {
    expect(Fragment.isSupportedType('application/json')).toBe(false);
    expect(Fragment.isSupportedType('image/png')).toBe(false);
  });

  test('getters (mimeType, isText) should work correctly', () => {
    const fragment = new Fragment({
      ownerId: 'abc',
      type: 'text/plain; charset=utf-8',
    });
    expect(fragment.mimeType).toBe('text/plain');
    expect(fragment.isText).toBe(true);
  });
});
