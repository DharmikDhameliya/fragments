// src/model/fragment.js
const { nanoid } = require('nanoid');
const contentType = require('content-type');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }
    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`unsupported type: ${type}`);
    }

    this.id = id || nanoid();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Static methods
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    const supportedTypes = [
      'text/plain',
      // We will add more types in future assignments
    ];
    return supportedTypes.includes(type);
  }

  /**
   * Instance methods
   */
  async save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  async getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    this.size = data.length;
    this.updated = new Date().toISOString();
    await this.save(); // Update metadata
    return writeFragmentData(this.ownerId, this.id, data);
  }

  static async byId(ownerId, id) {
    const metadata = await readFragment(ownerId, id);
    if (!metadata) {
      throw new Error(`fragment not found: ${id}`);
    }
    return new Fragment(metadata);
  }

  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  static async delete() {
    // Not implemented until Assignment 2
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    return [this.mimeType];
  }
}

module.exports.Fragment = Fragment;
