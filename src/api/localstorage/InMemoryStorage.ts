import LocalStorageCompatible from './LocalStorageCompatible';

export default class InMemoryStorage implements LocalStorageCompatible {
  private storage = {};
  length: number = 0;
  setItem(key: string, value: string) {
    if (!(key in this.storage)) {
      this.length = this.length + 1;
    }
    this.storage[key] = value;
  }
  getItem(key: string) {
    const res = key in this.storage ? this.storage[key] : null;
    return res;
  }
  removeItem(key: string) {
    if (key in this.storage) {
      delete this.storage[key];
      this.length = this.length - 1;
    }
  }
  key(n: number) {
    const keys = Object.keys(this.storage);
    return keys[n] || null;
  }

  clear() {
    this.storage = {};
    this.length = 0;
  }
}
