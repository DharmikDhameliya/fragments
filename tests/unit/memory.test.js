const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
} = require('../../src/model/data/memory/memory-db');

describe('Memory DB', () => {
  test('writeFragment() and readFragment()', async () => {
    const fragment = { ownerId: 'user1', id: 'a', type: 'text/plain' };
    await writeFragment(fragment);
    const result = await readFragment('user1', 'a');
    expect(result).toEqual(fragment);
  });

  test('listFragments() returns IDs for a user', async () => {
    const ownerId = 'list-test';
    await writeFragment({ ownerId, id: '1', type: 'text/plain' });
    await writeFragment({ ownerId, id: '2', type: 'text/plain' });

    const results = await listFragments(ownerId);
    expect(results).toContain('1');
    expect(results).toContain('2');
    expect(results.length).toBe(2);
  });

  test('listFragments(expand=true) returns full objects', async () => {
    const ownerId = 'expand-test';
    const f = { ownerId, id: '1', type: 'text/plain' };
    await writeFragment(f);

    const results = await listFragments(ownerId, true);
    expect(results[0]).toEqual(f);
  });

  test('writeFragmentData() and readFragmentData()', async () => {
    const data = Buffer.from('binary data');
    await writeFragmentData('user1', 'data-id', data);
    const result = await readFragmentData('user1', 'data-id');
    expect(result).toEqual(data);
  });
});
