import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  CircularProgress,
  WithStyles,
  withStyles,
  StyleRulesCallback,
  Toolbar,
  Typography,
  Omit
} from 'material-ui';
import { ClassNameMap } from 'material-ui/styles/withStyles';
import Bookmark from '../../model/Bookmark';
import i18n from '../../i18n/i18n';
import Tag from '../../model/Tag';
import { Link } from 'react-router-dom';

import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import BookmarkApiFactory from '../../api/BookmarkApiFactory';
import withRoot from '../../withRoot';
import BookmarksList from '../BookmarksList/BookmarksList';

export declare type StyledProp = 'content' | 'breadcrumbs' | 'link';

export interface TagPageState {
  loading: boolean;
  paginating: boolean;
  tag?: Tag;
  bookmarks?: Bookmark[];
  count: number;
}
export interface TagPageProps extends RouteComponentProps<any> {
  classes: ClassNameMap<StyledProp>;
}

class TagPage extends React.Component<TagPageProps & WithStyles<StyledProp>, TagPageState> {
  constructor(props: TagPageProps) {
    super(props);
    this.state = {
      loading: false,
      paginating: false,
      count: 0
    };
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      this.setState({ loading: true });

      BookmarkApiFactory.defaultFactory.tagApi
        .getById(this.props.match.params.id)
        .then(tag => {
          return Promise.all([
            this.newBookmarksQueryBuilder(tag),
            this.newCountQueryBuilder(tag)
          ]).then(res => {
            return { tag, bookmarks: res[0], count: res[1] };
          });
        })
        .then(res => {
          this.setState({
            loading: false,
            tag: res.tag,
            bookmarks: res.bookmarks,
            count: res.count
          });
        });
    }
  }

  private newBookmarksQueryBuilder = (tag: Tag) => {
    return BookmarkApiFactory.defaultFactory.bookmarkApi
      .newBookmarkQueryBuilder()
      .withTag(tag)
      .offset(this.state.bookmarks ? this.state.bookmarks.length : 0)
      .limit(10)
      .query();
  };

  private newCountQueryBuilder = (tag: Tag) => {
    return BookmarkApiFactory.defaultFactory.bookmarkApi
      .newBookmarkQueryBuilder()
      .withTag(tag)
      .count();
  };

  private onDeleteBookmark = (b: Bookmark) => {
    BookmarkApiFactory.defaultFactory.bookmarkApi.delete(b).then(() => {
      this.setState({
        bookmarks: this.state.bookmarks!.filter(x => x.id !== b.id),
        count: this.state.count - 1
      });
    });
  };

  private onPaginateNext = () => {
    this.setState({ paginating: true });
    this.newBookmarksQueryBuilder(this.state.tag!).then(bookmarks => {
      this.setState({
        bookmarks: this.state.bookmarks!.concat(bookmarks),
        paginating: false
      });
    });
  };

  render() {
    const { loading, bookmarks, count, paginating } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.content}>
        <Toolbar className={classes.breadcrumbs}>
          <Typography variant="title">
            <Link to="/" className={classes.link}>
              {i18n.t('home.label')}
            </Link>
          </Typography>

          <KeyboardArrowRight style={{ marginLeft: 10, marginRight: 10 }} />

          <Typography variant="title">
            {this.props.match.params.id && this.state.tag && this.state.tag.label}
          </Typography>
          {loading && <CircularProgress />}
        </Toolbar>
        {bookmarks &&
          withRoot(BookmarksList, this.props.theme!)({
            bookmarks,
            count,
            paginating,
            onDelete: this.onDeleteBookmark,
            onPaginateNext: this.onPaginateNext
          })}
      </div>
    );
  }
}

const styles: StyleRulesCallback<StyledProp> = theme => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },

  breadcrumbs: {
    textTransform: 'uppercase'
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  }
});

export default withStyles(styles)(TagPage) as React.ComponentClass<
  TagPageProps & Omit<TagPageProps, keyof ClassNameMap<any>>
>;
