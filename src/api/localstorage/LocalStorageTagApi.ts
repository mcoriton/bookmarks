import TagApi, { TagQueryBuilder } from '../TagApi';
import Tag from '../../model/Tag';
import LocalStorageCompatible from './LocalStorageCompatible';
const uuidv1 = require('uuid/v1');
const TAGS_KEY = 'tags';

/**
 * Tag API using LocalStorage as storage mechanism
 * Each Tag is saved to LocalStorage using it's id as key
 * Each Tag id is then referenced to TAGS_KEY on order to be retrieved
 *
 * @export
 * @class LocalStorageTagApi
 * @implements {TagApi}
 */
export default class LocalStorageTagApi implements TagApi {
  private storage: LocalStorageCompatible;
  constructor(storage: LocalStorageCompatible) {
    this.storage = storage;
  }

  /** @inheritDoc */
  newTagQueryBuilder(): TagQueryBuilder {
    return new LocalStorageTagQueryBuilder(this);
  }

  /** @inheritDoc */
  getTagIds(): string[] {
    const serialized = this.storage.getItem(TAGS_KEY);
    if (!serialized) return [];
    return JSON.parse(serialized);
  }

  /** @inheritDoc */
  getById(id: string): Promise<Tag> {
    const saved = this.storage.getItem(id);
    if (!saved) return Promise.reject('Not found');
    const parsed = JSON.parse(saved!);
    return Promise.resolve(parsed);
  }
  /** @inheritDoc */
  delete(tag: Tag): Promise<void> {
    this.storage.removeItem(tag.id);

    const ids = this.getTagIds();
    for (const e in ids) {
      if (ids[e] === tag.id) {
        ids.splice(parseInt(e, 10), 1);
        break;
      }
    }
    this.storage.setItem(TAGS_KEY, JSON.stringify(ids));
    return Promise.resolve();
  }

  /**
   * Save given tag to localstorage and add it's id to TAGS_KEY if required
   *
   * @private
   * @param {Tag} tag
   * @returns {Promise<Tag>}
   * @memberof LocalStorageTagApi
   */
  // tslint:disable-next-line:function-name
  private _save(tag: Tag): Promise<Tag> {
    if (!this.storage.getItem(tag.id)) {
      const ids = this.getTagIds();
      ids.push(tag.id);
      this.storage.setItem(TAGS_KEY, JSON.stringify(ids));
    }

    this.storage.setItem(tag.id, JSON.stringify(tag));
    return Promise.resolve(tag);
  }

  /** @inheritDoc */
  save(tag: Tag): Promise<Tag> {
    return this._save(tag);
  }

  /** @inheritDoc */
  newTag(label: string): Promise<Tag> {
    const tag = {
      label,
      id: uuidv1()
    };
    return this._save(tag);
  }
}

/**
 * QueryBuilder for Local storage base Api
 *
 * @class LocalStorageTagQueryBuilder
 * @implements {TagQueryBuilder}
 */
class LocalStorageTagQueryBuilder implements TagQueryBuilder {
  // tslint:disable-next-line:variable-name
  private _offset: number = 0;
  // tslint:disable-next-line:variable-name
  private _limit: number = 10;
  // tslint:disable-next-line:variable-name
  private _label: string | undefined;

  // tslint:disable-next-line:variable-name
  private _storageApi: LocalStorageTagApi;

  constructor(storageApi: LocalStorageTagApi) {
    this._storageApi = storageApi;
  }

  /** @inheritDoc */
  offset(offset: number): TagQueryBuilder {
    this._offset = offset;
    return this;
  }

  /** @inheritDoc */
  limit(limit: number): TagQueryBuilder {
    this._limit = limit;
    return this;
  }

  label(label: string): TagQueryBuilder {
    this._label = label;
    return this;
  }

  /** @inheritDoc */
  count(): Promise<number> {
    if (this._label) {
      const ids: string[] = this._storageApi.getTagIds();
      const promises = [];
      for (const id of ids) {
        promises.push(this._storageApi.getById(id));
      }
      return Promise.all(promises).then(tags => {
        return tags.filter(tag => tag.label === this._label).length;
      });
    }
    return Promise.resolve(this._storageApi.getTagIds().length);
  }

  /** @inheritDoc */
  query(): Promise<Tag[]> {
    let ids: string[] = this._storageApi.getTagIds();
    if (this._label) {
      const promises = [];
      for (const id of ids) {
        promises.push(this._storageApi.getById(id));
      }
      return Promise.all(promises).then(tags => {
        return tags
          .filter(tag => tag.label === this._label)
          .slice(this._offset, this._offset + this._limit);
      });
    }

    ids = ids.slice(this._offset, this._offset + this._limit);
    const res: Promise<Tag>[] = [];
    for (const e of ids) {
      res.push(this._storageApi.getById(e));
    }
    return Promise.all(res);
  }
}
