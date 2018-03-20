import Tag from './Tag';

/**
 * Created by matthieucoriton on 14/03/2018.
 */

export enum BookmarkType {
  Video,
  Image
}

export default interface Bookmark {
  readonly id: string;
  url: string;
  thumbURL: string;
  readonly type: BookmarkType;
  title: string;
  authorName: string;
  addedAt: Date;
  tags?: Tag[];
};
