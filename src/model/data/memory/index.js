// src/model/data/memory/index.js

const {
  writeFragment,
  readFragment,
  listFragments,
  writeFragmentData,
  readFragmentData,
} = require('./memory-db');

module.exports = {
  writeFragment,
  readFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
};
