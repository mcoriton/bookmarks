import Bookmark from '../model/Bookmark';
import VideoBookmark from '../model/VideoBookmark';
import ImageBookmark from '../model/ImageBookmark';
import Tag from '../model/Tag';

export interface BookmarkQueryBuilder {
  /**
   * Defines the start offset
   *
   * @param {number} offset
   * @returns {BookmarkQueryBuilder}
   * @memberof BookmarkQueryBuilder
   */
  offset(offset: number): BookmarkQueryBuilder;
  /**
   * Defines the number of items to retrieve (default 10)
   *
   * @param {number} limit
   * @returns {BookmarkQueryBuilder}
   * @memberof BookmarkQueryBuilder
   */
  limit(limit: number): BookmarkQueryBuilder;
  /**
   * Returns a list of Bookmark located using start offset and limit
   *
   * @returns {Promise<Bookmark[]>}
   * @memberof BookmarkQueryBuilder
   */
  query(): Promise<Bookmark[]>;

  /**
   * Returns the number of bookmarks in the storage.
   *
   * @returns {Promise<number>}
   * @memberof BookmarkQueryBuilder
   */
  count(): Promise<number>;

  /**
   * Filters out bookmarks not containing given bookmark
   *
   * @param {Tag} tag
   * @returns {BookmarkQueryBuilder}
   * @memberof BookmarkQueryBuilder
   */
  withTag(tag: Tag): BookmarkQueryBuilder;
}

/**
 * Main inteface for CRUD on Bookmarks
 *
 * @export
 * @interface BookmarkApi
 */
export default interface BookmarkApi {
  /**
   * Returns a new query builder allowing user to query/count based on some criteria
   *
   * @returns {BookmarkQueryBuilder}
   * @memberof BookmarkApi
   */
  newBookmarkQueryBuilder(): BookmarkQueryBuilder;

  /**
   * Creates a new VideoBookmark persisting it to storage
   *
   * @param {{
   *     url: string;
   *     thumbURL: string;
   *     title: string;
   *     authorName: string;
   *     width: number; width in pixel
   *     height: number; height in pixel
   *     duration: number; duration in second
   *   }} data
   * @returns {Promise<VideoBookmark>}
   * @memberof BookmarkApi
   */
  newVideoBookmark(data: {
    url: string;
    thumbURL: string;
    title: string;
    authorName: string;
    width: number;
    height: number;
    duration: number;
    tags?: Tag[];
  }): Promise<VideoBookmark>;
  /**
   * Creates a new ImageBookmark persisting it to storage
   *
   * @param {{
   *     url: string;
   *     thumbURL: string;
   *     title: string;
   *     authorName: string;
   *     width: number;
   *     height: number;
   *   }} data
   * @returns {Promise<ImageBookmark>}
   * @memberof BookmarkApi
   */
  newImageBookmark(data: {
    url: string;
    thumbURL: string;
    title: string;
    authorName: string;
    width: number;
    height: number;
    tags?: Tag[];
  }): Promise<ImageBookmark>;

  /**
   * Save given bookmark to storage.
   * Given bookmark must have been previously created using newVideoBookmark/newImageBookmark
   *
   * @param {Bookmark} bookmark
   * @returns {Promise<Bookmark>}
   * @memberof BookmarkApi
   */
  save(bookmark: Bookmark): Promise<Bookmark>;

  /**
   * Returns th bookmark with given id.
   * Rejects promise if bookmark cannot be found
   *
   * @param {string} id
   * @returns {Promise<Bookmark>}
   * @memberof BookmarkApi
   */
  getById(id: string): Promise<Bookmark>;

  /**
   * Deletes given bookmark and removes it from storage
   *
   * @param {Bookmark} bookmark
   * @returns {Promise<void>}
   * @memberof BookmarkApi
   */
  delete(bookmark: Bookmark): Promise<void>;
};
