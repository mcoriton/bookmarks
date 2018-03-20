import Tag from '../model/Tag';

export interface TagQueryBuilder {
  /**
   * Defines the start offset
   *
   * @param {number} offset
   * @returns {TagQueryBuilder}
   * @memberof TagQueryBuilder
   */
  offset(offset: number): TagQueryBuilder;
  /**
   * Defines the number of items to retrieve (default 10)
   *
   * @param {number} limit
   * @returns {TagQueryBuilder}
   * @memberof TagQueryBuilder
   */
  limit(limit: number): TagQueryBuilder;

  /**
   * Filter result based on label
   *
   * @param {number} limit
   * @returns {TagQueryBuilder}
   * @memberof TagQueryBuilder
   */
  label(label: string): TagQueryBuilder;

  /**
   * Returns a list of tags using start offset and limit
   *
   * @returns {Promise<Tag[]>}
   * @memberof TagQueryBuilder
   */
  query(): Promise<Tag[]>;

  /**
   * Returns the number of tags in the storage.
   *
   * @returns {Promise<number>}
   * @memberof TagQueryBuilder
   */
  count(): Promise<number>;
}

/**
 * Main inteface for CRUD on Tag
 *
 * @export
 * @interface TagApi
 */
export default interface TagApi {
  /**
   * Returns a new query builder allowing user to query/count based on some criteria
   *
   * @returns {TagQueryBuilder}
   * @memberof TagApi
   */
  newTagQueryBuilder(): TagQueryBuilder;

  /**
   * Returns a new tag and save it to backed storage
   *
   * @param {string} label
   * @returns {Promise<Tag>}
   * @memberof TagApi
   */
  newTag(label: string): Promise<Tag>;

  /**
   * Save given tag to storage.
   * Given Tag must have been previously created using newTag
   *
   * @param {Tag} tag
   * @returns {Promise<Tag>}
   * @memberof TagApi
   */
  save(tag: Tag): Promise<Tag>;

  /**
   * Returns tag with given id.
   * Rejects promise if tag cannot be found
   *
   * @param {string} id
   * @returns {Promise<Tag>}
   * @memberof TagApi
   */
  getById(id: string): Promise<Tag>;

  /**
   * Deletes given tag and removes it from storage
   *
   * @param {Tag} tag
   * @returns {Promise<void>}
   * @memberof TagApi
   */
  delete(tag: Tag): Promise<void>;
};
