// src/model/fragment.js
const { nanoid } = require('nanoid');
const contentType = require('content-type');
const md = require('markdown-it')();
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
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
   * Checks if the given type is supported by the Fragment service.
   * @param {string} value - The Content-Type string to validate
   * @returns {boolean}
   */
  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      const supportedTypes = ['text/plain', 'text/markdown', 'text/html', 'application/json'];
      return supportedTypes.includes(type);
    } catch {
      return false;
    }
  }

  /**
   * Saves the fragment metadata to the database
   * @returns {Promise}
   */
  async save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's raw data from the database
   * @returns {Promise<Buffer>}
   */
  async getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Sets the fragment's raw data in the database and updates size/updated fields
   * @param {Buffer} data
   * @returns {Promise}
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    this.size = data.length;
    this.updated = new Date().toISOString();
    await this.save();
    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Gets a fragment by its ID for a given owner
   * @param {string} ownerId
   * @param {string} id
   * @returns {Promise<Fragment>}
   */
  static async byId(ownerId, id) {
    const metadata = await readFragment(ownerId, id);
    if (!metadata) {
      throw new Error(`fragment not found: ${id}`);
    }
    return new Fragment(metadata);
  }

  /**
   * Gets all fragments for a given owner
   * @param {string} ownerId
   * @param {boolean} expand
   * @returns {Promise<Array>}
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Deletes a fragment by owner and ID
   * @param {string} ownerId
   * @param {string} id
   * @returns {Promise}
   */
  static async delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Returns the mime type without parameters (e.g., 'text/plain')
   * @returns {string}
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if the fragment is a text type
   * @returns {boolean}
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the list of supported conversion formats for this fragment
   * @returns {Array<string>}
   */
  get formats() {
    const conversionMap = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'application/json': ['application/json', 'text/plain'],
    };
    return conversionMap[this.mimeType] || [this.mimeType];
  }

  /**
   * Converts the fragment data to the requested target MIME type.
   * @param {Buffer} data
   * @param {string} targetType
   * @returns {{ data: Buffer, mimeType: string }}
   */
  convertTo(data, targetType) {
    const source = this.mimeType;

    if (source === targetType) {
      return { data, mimeType: source };
    }

    if (source === 'text/markdown' && targetType === 'text/html') {
      const html = md.render(data.toString());
      return { data: Buffer.from(html), mimeType: 'text/html' };
    }

    if (targetType === 'text/plain') {
      return { data: Buffer.from(data.toString()), mimeType: 'text/plain' };
    }

    throw new Error(`cannot convert ${source} to ${targetType}`);
  }
}

module.exports.Fragment = Fragment;
