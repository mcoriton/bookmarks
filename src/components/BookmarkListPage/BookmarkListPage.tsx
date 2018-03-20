import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  Button,
  CircularProgress,
  WithStyles,
  withStyles,
  StyleRulesCallback,
  Omit
} from 'material-ui';
import Add from 'material-ui-icons/Add';
import { ClassNameMap } from 'material-ui/styles/withStyles';
import BookmarkApiFactory from '../../api/BookmarkApiFactory';
import Bookmark from '../../model/Bookmark';
import withRoot from '../../withRoot';
import BookmarksList from '../BookmarksList/BookmarksList';
import NoResults from '../NoResults';
import i18n from '../../i18n/i18n';
export declare type StyledProp = 'fab' | 'container';

const LIMIT = 10;

export interface BookmarkListPageState {
  paginating: boolean;
  loading: boolean;
  bookmarks: Bookmark[];
  count: number;
}
export interface BookmarkListPageProps extends RouteComponentProps<any> {
  classes: ClassNameMap<StyledProp>;
}

/**
 * Component displaying a list of bookmarks as a infinite scrolling grid
 */
class BookmarkListPage extends React.Component<
  BookmarkListPageProps & WithStyles<StyledProp>,
  BookmarkListPageState
> {
  constructor(props: BookmarkListPageProps) {
    super(props);
    this.state = { loading: false, bookmarks: [], count: 0, paginating: false };
  }

  componentDidMount() {
    this.setState({ loading: true });
    Promise.all([this.newQueryBuilder(), this.newCountQueryBuilder()]).then(res => {
      this.setState({ bookmarks: res[0], count: res[1], loading: false });
    });
  }

  private newCountQueryBuilder = () => {
    return BookmarkApiFactory.defaultFactory.bookmarkApi.newBookmarkQueryBuilder().count();
  };

  private newQueryBuilder = () => {
    return BookmarkApiFactory.defaultFactory.bookmarkApi
      .newBookmarkQueryBuilder()
      .offset(this.state.bookmarks.length)
      .limit(LIMIT)
      .query();
  };

  private onDeleteBookmark = (b: Bookmark) => {
    BookmarkApiFactory.defaultFactory.bookmarkApi.delete(b).then(() => {
      this.setState({
        bookmarks: this.state.bookmarks.filter(x => x.id !== b.id),
        count: this.state.count - 1
      });
    });
  };

  private onPaginateNext = () => {
    this.setState({ paginating: true });
    this.newQueryBuilder().then(bookmarks => {
      this.setState({
        bookmarks: this.state.bookmarks.concat(bookmarks),
        paginating: false
      });
    });
  };

  private onNewClicked = () => {
    this.props.history.push('/bookmark');
  };

  render() {
    const { loading, bookmarks, paginating, count } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.container} id="bookmarkPage">
        {loading && <CircularProgress />}

        {count > 0 &&
          withRoot(BookmarksList, this.props.theme!)({
            bookmarks,
            count,
            paginating,
            onDelete: this.onDeleteBookmark,
            onPaginateNext: this.onPaginateNext
          })}

        {count === 0 && !loading && <NoResults message={i18n.t('bookmarks.empty')} />}

        <Button
          className={classes.fab}
          variant="fab"
          color="primary"
          aria-label="add"
          onClick={this.onNewClicked}
        >
          <Add />
        </Button>
      </div>
    );
  }
}

const styles: StyleRulesCallback<StyledProp> = theme => ({
  container: {
    display: 'flex',
    flex: 1
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(BookmarkListPage) as React.ComponentClass<
  BookmarkListPageProps & Omit<BookmarkListPageProps, keyof ClassNameMap<any>>
>;
