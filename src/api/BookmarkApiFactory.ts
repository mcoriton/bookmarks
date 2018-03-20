import BookmarkApi from './BookmarkApi';
import LocalStorageBookmarkApi from './localstorage/LocalStorageBookmarkApi';
import TagApi from './TagApi';
import LocalStorageTagApi from './localstorage/LocalStorageTagApi';
import LocalStorageCompatible from './localstorage/LocalStorageCompatible';

export default class BookmarkApiFactory {
  /**
   * The factory to use all along app
   *
   * @static
   * @type {BookmarkApiFactory}
   * @memberof BookmarkApiFactory
   */
  static defaultFactory: BookmarkApiFactory;

  // tslint:disable-next-line:variable-name
  protected _bookmarkApi: BookmarkApi;

  // tslint:disable-next-line:variable-name
  protected _tagApi: TagApi;

  /**
   * Returns helper for CRUD operations on bookmarks
   *
   * @readonly
   * @type {BookmarkApi}
   * @memberof BookmarkApiFactory
   */
  public get bookmarkApi(): BookmarkApi {
    return this._bookmarkApi;
  }

  /**
   * Returns helper for CRUD operations on tags
   *
   * @readonly
   * @type {TagApi}
   * @memberof BookmarkApiFactory
   */
  public get tagApi(): TagApi {
    return this._tagApi;
  }
}

/**
 * Bookmark api using LocalStorage as storage mechanism
 *
 * @export
 * @class LocalStorageBookmarkApiFactory
 * @extends {BookmarkApiFactory}
 */
export class LocalStorageBookmarkApiFactory extends BookmarkApiFactory {
  constructor(storage: LocalStorageCompatible) {
    super();
    this._bookmarkApi = new LocalStorageBookmarkApi(storage);
    this._tagApi = new LocalStorageTagApi(storage);
  }
}
