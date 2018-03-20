import BookmarkApi, { BookmarkQueryBuilder } from '../BookmarkApi';
import Bookmark, { BookmarkType } from '../../model/Bookmark';
import VideoBookmark from '../../model/VideoBookmark';
import ImageBookmark from '../../model/ImageBookmark';
import Tag from '../../model/Tag';
import BookmarkApiFactory from '../BookmarkApiFactory';
import LocalStorageCompatible from './LocalStorageCompatible';
const uuidv1 = require('uuid/v1');
const BOOKMARKS_KEY = 'bookmarks';

/**
 * Bookmark API using LocalStorage as storage mechanism
 * Each Bookmark is saved to LocalStorage using it's id as key
 * Each Bookmark id is then referenced to BOOKMARKS_KEY on order to be retrieved
 *
 * @export
 * @class LocalStorageBookmarkApi
 * @implements {BookmarkApi}
 */
export default class LocalStorageBookmarkApi implements BookmarkApi {
  private storage: LocalStorageCompatible;
  constructor(storage: LocalStorageCompatible) {
    this.storage = storage;
  }

  /** @inheritDoc */
  newBookmarkQueryBuilder(): BookmarkQueryBuilder {
    return new LocalStorageBookmarkQueryBuilder(this);
  }

  /** @inheritDoc */
  getBookmarksIds(): string[] {
    const serialized = this.storage.getItem(BOOKMARKS_KEY);
    if (!serialized) return [];
    return JSON.parse(serialized);
  }

  /** @inheritDoc */
  getById(id: string): Promise<Bookmark> {
    const saved = this.storage.getItem(id);
    if (!saved) return Promise.reject('Not found');
    const parsed = JSON.parse(saved!);
    parsed.addedAt = new Date(parsed.addedAt);
    if (!parsed.tags) {
      return Promise.resolve(parsed);
    }
    const promises = [];
    for (const id of parsed.tags) {
      promises.push(BookmarkApiFactory.defaultFactory.bookmarkApi.getById(id as string));
    }

    return Promise.all(promises).then(tags => {
      parsed.tags = tags;
      return parsed;
    });
  }
  /** @inheritDoc */
  delete(bookmark: Bookmark): Promise<void> {
    this.storage.removeItem(bookmark.id);

    const ids = this.getBookmarksIds();
    for (const e in ids) {
      if (ids[e] === bookmark.id) {
        ids.splice(parseInt(e, 10), 1);
        break;
      }
    }
    this.storage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
    return Promise.resolve();
  }

  /** @inheritDoc */
  newVideoBookmark(data: {
    url: string;
    thumbURL: string;
    title: string;
    authorName: string;
    width: number;
    height: number;
    duration: number;
    tags?: Tag[];
  }): Promise<VideoBookmark> {
    const bookmark = {
      id: uuidv1(),
      url: data.url,
      thumbURL: data.thumbURL,
      title: data.title,
      authorName: data.authorName,
      type: BookmarkType.Video,
      width: data.width,
      height: data.height,
      duration: data.duration,
      addedAt: new Date(),
      tags: data.tags
    };
    return this._save(bookmark) as Promise<VideoBookmark>;
  }

  /**
   * Save given bookmark to localstorage and add it's id to BOOKMARKS_KEY if required
   *
   * @private
   * @param {Bookmark} bookmark
   * @returns {Promise<Bookmark>}
   * @memberof LocalStorageBookmarkApi
   */
  // tslint:disable-next-line:function-name
  private _save(bookmark: Bookmark): Promise<Bookmark> {
    if (!this.storage.getItem(bookmark.id)) {
      const bookmarksIds = this.getBookmarksIds();
      bookmarksIds.push(bookmark.id);
      this.storage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksIds));
    }

    const serialized: any = Object.assign({}, bookmark);
    if (serialized['tags']) {
      serialized['tags'] = serialized['tags'].map((t: Tag) => t.id);
    }
    this.storage.setItem(bookmark.id, JSON.stringify(serialized));
    return Promise.resolve(bookmark);
  }

  /** @inheritDoc */
  save(bookmark: Bookmark): Promise<Bookmark> {
    return this._save(bookmark);
  }

  /** @inheritDoc */
  newImageBookmark(data: {
    url: string;
    thumbURL: string;

    title: string;
    authorName: string;
    width: number;
    height: number;
    tags?: Tag[];
  }): Promise<ImageBookmark> {
    const bookmark = {
      id: uuidv1(),
      url: data.url,
      thumbURL: data.thumbURL,
      title: data.title,
      authorName: data.authorName,
      type: BookmarkType.Image,
      width: data.width,
      height: data.height,
      addedAt: new Date(),
      tags: data.tags
    };
    return this._save(bookmark) as Promise<ImageBookmark>;
  }
}

/**
 * QueryBuilder for Local storage base Api
 *
 * @class LocalStorageBookmarkQueryBuilder
 * @implements {BookmarkQueryBuilder}
 */
export class LocalStorageBookmarkQueryBuilder implements BookmarkQueryBuilder {
  // tslint:disable-next-line:variable-name
  private _offset: number = 0;
  // tslint:disable-next-line:variable-name
  private _limit: number = 10;
  // tslint:disable-next-line:variable-name
  private _storageApi: LocalStorageBookmarkApi;
  // tslint:disable-next-line:variable-name
  private _tag?: Tag;

  constructor(storageApi: LocalStorageBookmarkApi) {
    this._storageApi = storageApi;
  }

  /** @inheritDoc */
  offset(offset: number): BookmarkQueryBuilder {
    this._offset = offset;
    return this;
  }

  /** @inheritDoc */
  limit(limit: number): BookmarkQueryBuilder {
    this._limit = limit;
    return this;
  }

  /** @inheritDoc */
  withTag(tag: Tag): BookmarkQueryBuilder {
    this._tag = tag;
    return this;
  }

  /** @inheritDoc */
  count(): Promise<number> {
    if (this._tag) {
      const ids = this._storageApi.getBookmarksIds();
      const promises = ids.map(id => this._storageApi.getById(id));
      return Promise.all(promises).then(bookmarks => {
        return bookmarks.filter(b => {
          if (!b.tags) return false;
          return (
            b.tags.filter(tag => {
              return tag.id === this._tag!.id;
            }).length > 0
          );
        }).length;
      });
    }
    return Promise.resolve(this._storageApi.getBookmarksIds().length);
  }

  /** @inheritDoc */
  query(): Promise<Bookmark[]> {
    if (this._tag) {
      const ids = this._storageApi.getBookmarksIds();
      const promises = ids.map(id => this._storageApi.getById(id));
      return Promise.all(promises).then(bookmarks => {
        return bookmarks
          .filter(b => {
            if (!b.tags) return false;
            return (
              b.tags.filter(tag => {
                return tag.id === this._tag!.id;
              }).length > 0
            );
          })
          .slice(this._offset, this._offset + this._limit);
      });
    }
    let ids: string[] = this._storageApi.getBookmarksIds();
    ids = ids.slice(this._offset, this._offset + this._limit);
    const res: Promise<Bookmark>[] = [];
    for (const e of ids) {
      res.push(this._storageApi.getById(e));
    }
    return Promise.all(res);
  }
}
