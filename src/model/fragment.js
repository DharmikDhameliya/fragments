const { nanoid } = require('nanoid');
const contentType = require('content-type');
const md = require('markdown-it')();
const sharp = require('sharp');
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

  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      const supportedTypes = [
        'text/plain',
        'text/markdown',
        'text/html',
        'application/json',
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
        'image/avif',
      ];
      return supportedTypes.includes(type);
    } catch {
      return false;
    }
  }

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
    await this.save();
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

  static async delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
    const conversionMap = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'application/json': ['application/json', 'text/plain'],
      'image/png': imageTypes,
      'image/jpeg': imageTypes,
      'image/webp': imageTypes,
      'image/gif': imageTypes,
      'image/avif': imageTypes,
    };
    return conversionMap[this.mimeType] || [this.mimeType];
  }

  async convertTo(data, targetType) {
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

    const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
    if (imageTypes.includes(source) && imageTypes.includes(targetType)) {
      const formatMap = {
        'image/png': 'png',
        'image/jpeg': 'jpeg',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/avif': 'avif',
      };
      const converted = await sharp(data).toFormat(formatMap[targetType]).toBuffer();
      return { data: converted, mimeType: targetType };
    }

    throw new Error(`cannot convert ${source} to ${targetType}`);
  }
}

module.exports.Fragment = Fragment;
