import Bookmark from './Bookmark';

export default interface VideoBookmark extends Bookmark {
  width: number;
  height: number;
  /**
   * Duration in second
   *
   * @type {number}
   * @memberof VideoBookmark
   */
  duration: number;
};
