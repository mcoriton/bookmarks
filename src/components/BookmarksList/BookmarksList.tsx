import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  CircularProgress,
  Button,
  WithStyles,
  withStyles,
  StyleRulesCallback,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Omit
} from 'material-ui';
import { ClassNameMap } from 'material-ui/styles/withStyles';
import Bookmark, { BookmarkType } from '../../model/Bookmark';
import i18n from '../../i18n/i18n';
import VideoBookmark from '../../model/VideoBookmark';
import ImageBookmark from '../../model/ImageBookmark';
import * as moment from 'moment/moment';
import Tag from '../../model/Tag';
import { Link } from 'react-router-dom';
export declare type StyledProp =
  | 'card'
  | 'media'
  | 'list'
  | 'listItem'
  | 'propertyList'
  | 'tag'
  | 'container';

export interface BookmarksListState {}
export interface BookmarksListProps extends RouteComponentProps<any> {
  bookmarks: Bookmark[];
  count: number;
  classes: ClassNameMap<StyledProp>;
  onDelete?: (b: Bookmark) => void;
  onPaginateNext: () => void;
  paginating: boolean;
}

/**
 * Component displaying a list of bookmarks as a infinite scrolling grid
 */
class BookmarksList extends React.Component<
  BookmarksListProps & WithStyles<StyledProp>,
  BookmarksListState
> {
  constructor(props: BookmarksListProps) {
    super(props);
    this.state = {};
  }

  private deleteBookmark = (event: React.MouseEvent<HTMLElement>, b: Bookmark) => {
    event.stopPropagation();
    if (this.props.onDelete) {
      this.props.onDelete(b);
    }
  };

  private editBookmark = (event: React.MouseEvent<HTMLElement>, b: Bookmark) => {
    event.stopPropagation();
    this.props.history.push(`/bookmark/${b.id}`);
  };

  private onLinkClicked = (b: Bookmark) => {
    window.open(b.url, 'blank');
  };

  private renderTags = (tags: Tag[]) => {
    const { classes } = this.props;
    return (
      <li>
        {tags.map(t => {
          return (
            <Link
              className={classes.tag}
              key={t.id}
              to={`/tags/${t.id}`}
              onClick={e => e.stopPropagation()}
            >{`#${t.label}`}</Link>
          );
        })}
      </li>
    );
  };

  private createListItem = (b: Bookmark) => {
    const { classes } = this.props;
    return (
      <li className={classes.listItem} key={b.id} onClick={() => this.onLinkClicked(b)}>
        <Card className={classes.card}>
          <CardMedia className={classes.media} image={b.thumbURL} title={b.title} />
          <CardContent>
            <Typography variant="headline" component="h2">
              {b.title}
            </Typography>
            <Typography component="div">
              <ul className={classes.propertyList}>
                <li>{i18n.t('author.value', { author: b.authorName })}</li>
                {b.type === BookmarkType.Video && (
                  <div>
                    <li>
                      {i18n.t('width.value', {
                        width: (b as VideoBookmark).width
                      })}
                    </li>
                    <li>
                      {i18n.t('height.value', {
                        height: (b as VideoBookmark).height
                      })}
                    </li>
                    <li>
                      {i18n.t('duration.value', {
                        duration: moment.duration((b as VideoBookmark).duration, 's').humanize()
                      })}
                    </li>
                    {b.tags && this.renderTags(b.tags)}
                  </div>
                )}

                {b.type === BookmarkType.Image && (
                  <div>
                    <li>
                      {i18n.t('width.value', {
                        width: (b as ImageBookmark).width
                      })}
                    </li>
                    <li>
                      {i18n.t('height.value', {
                        height: (b as ImageBookmark).height
                      })}
                    </li>
                    {b.tags && this.renderTags(b.tags)}
                  </div>
                )}
              </ul>
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={e => this.deleteBookmark(e, b)}>
              {i18n.t('delete.label')}
            </Button>
            <Button size="small" color="primary" onClick={e => this.editBookmark(e, b)}>
              {i18n.t('edit.label')}
            </Button>
          </CardActions>
        </Card>
      </li>
    );
  };

  private onScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const e = event.nativeEvent.srcElement!;
    if (
      e.clientHeight - e.scrollTop < 300 &&
      this.props.bookmarks.length < this.props.count &&
      this.props.onPaginateNext
    ) {
      console.log('Paginating next');
      this.props.onPaginateNext();
    }
  };

  render() {
    const { classes, bookmarks, paginating } = this.props;
    return (
      <div className={classes.container}>
        <ul className={classes.list} onScroll={this.onScroll}>
          {bookmarks.map(b => this.createListItem(b))}
          {paginating && (
            <li>
              <CircularProgress />
            </li>
          )}
        </ul>
      </div>
    );
  }
}

const styles: StyleRulesCallback<StyledProp> = theme => ({
  container: {
    display: 'flex',
    overflow: 'hidden'
  },
  list: {
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'auto',
    padding: 2 * theme.spacing.unit,
    listStyle: 'none',
    justifyContent: 'flex-start',
    [theme.breakpoints.up('md')]: {
      margin: 0
    }
  },
  listItem: {
    margin: 2 * theme.spacing.unit,
    cursor: 'pointer'
  },
  card: {
    maxWidth: 345
  },
  media: {
    height: 200,
    width: 345
  },
  propertyList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  tag: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing.unit,
    textDecoration: 'none'
  }
});
const styled = withStyles(styles)(BookmarksList);
const res = withRouter(styled) as React.ComponentClass<
  Omit<BookmarksListProps, keyof ClassNameMap<any>>
>;
export default res;
