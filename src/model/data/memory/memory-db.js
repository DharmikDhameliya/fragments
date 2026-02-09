// src/model/data/memory/memory-db.js

// In-memory database for fragments
const data = {};

/**
 * Writes a fragment metadata object to the in-memory db.
 * @param {Object} fragment
 * @returns {Promise<void>}
 */
function writeFragment(fragment) {
  if (!data[fragment.ownerId]) {
    data[fragment.ownerId] = {};
  }
  data[fragment.ownerId][fragment.id] = fragment;
  return Promise.resolve();
}

/**
 * Reads fragment metadata.
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
function readFragment(ownerId, id) {
  if (data[ownerId] && data[ownerId][id]) {
    return Promise.resolve(data[ownerId][id]);
  }
  return Promise.resolve(null);
}

/**
 * Returns IDs (or full fragments) for a user.
 * @param {string} ownerId
 * @param {boolean} expand
 * @returns {Promise<Array>}
 */
function listFragments(ownerId, expand = false) {
  const userData = data[ownerId] || {};
  const fragments = Object.values(userData);

  if (expand) {
    return Promise.resolve(fragments);
  }
  return Promise.resolve(fragments.map((f) => f.id));
}

/**
 * Writes fragment data (binary) to memory.
 * We'll store it under a separate key: `${id}.data`
 */
const rawData = {};

function writeFragmentData(ownerId, id, buffer) {
  if (!rawData[ownerId]) {
    rawData[ownerId] = {};
  }
  rawData[ownerId][id] = buffer;
  return Promise.resolve();
}

function readFragmentData(ownerId, id) {
  if (rawData[ownerId] && rawData[ownerId][id]) {
    return Promise.resolve(rawData[ownerId][id]);
  }
  return Promise.resolve(null);
}

module.exports = {
  writeFragment,
  readFragment,
  listFragments,
  writeFragmentData,
  readFragmentData,
};
