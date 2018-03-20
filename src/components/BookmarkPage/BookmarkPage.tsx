import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  Button,
  CircularProgress,
  WithStyles,
  withStyles,
  StyleRulesCallback,
  TextField,
  Input,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  Typography,
  FormHelperText,
  Theme,
  Omit
} from 'material-ui';
import { ClassNameMap } from 'material-ui/styles/withStyles';
import Bookmark, { BookmarkType } from '../../model/Bookmark';
import BookmarkApiFactory from '../../api/BookmarkApiFactory';
import ImageBookmark from '../../model/ImageBookmark';
import VideoBookmark from '../../model/VideoBookmark';
import i18n from '../../i18n/i18n';
import Cached from 'material-ui-icons/Cached';
import VimeoConnector from '../../connectors/VimeoConnector';
import Tag from '../../model/Tag';
import { Link } from 'react-router-dom';

import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import FlickrConnector from '../../connectors/FlickrConnector';
import TagList from '../TagList/TagList';
import withRoot from '../../withRoot';
import * as moment from 'moment/moment';
const validUrl = require('valid-url');
export declare type StyledProp =
  | 'content'
  | 'submit'
  | 'input'
  | 'breadcrumbs'
  | 'form'
  | 'link'
  | 'tagsContainer';

export enum BOOKMARK_PROP {
  URL = 'url',
  THUMB_URL = 'thumbURL',
  TITLE = 'title',
  AUTHOR = 'authorName',
  WIDTH = 'width',
  HEIGHT = 'height',
  DURATION = 'duration',
  TYPE = 'type'
}
export interface BookmarkPageState {
  loading: boolean;
  bookmark?: Bookmark;
  saving: boolean;
  url?: string;
  thumbURL?: string;
  type: BookmarkType;
  title?: string;
  authorName?: string;
  addedAt?: Date;
  tags?: Tag[];
  width?: number;
  height?: number;
  duration?: number;
  errors?: { [name: string]: string };
  completed: boolean;
}
export interface BookmarkPageProps extends RouteComponentProps<any> {
  classes: ClassNameMap<StyledProp>;
  theme: Theme;
}

/**
 * Component for bookmark creation/edition
 */
class BookmarkPage extends React.Component<
  BookmarkPageProps & WithStyles<StyledProp>,
  BookmarkPageState
> {
  constructor(props: BookmarkPageProps) {
    super(props);
    this.state = {
      loading: false,
      saving: false,
      type: BookmarkType.Image,
      completed: false
    };
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      this.setState({ loading: true });
      BookmarkApiFactory.defaultFactory.bookmarkApi.getById(this.props.match.params.id).then(b => {
        const state: Partial<BookmarkPageState> = {
          bookmark: b,
          loading: false,
          url: b.url,
          thumbURL: b.thumbURL,
          type: b.type,
          title: b.title,
          authorName: b.authorName,
          addedAt: b.addedAt,
          tags: b.tags
        };
        if (b.type === BookmarkType.Image) {
          // tslint:disable-next-line:variable-name
          const _image = b as ImageBookmark;

          state.width = _image.width;
          state.height = _image.height;
        } else {
          // tslint:disable-next-line:variable-name
          const _video = b as VideoBookmark;

          state.width = _video.width;
          state.height = _video.height;
          state.duration = _video.duration;
        }
        state.completed = this.checkCompleted(state, [
          BOOKMARK_PROP.URL,
          BOOKMARK_PROP.THUMB_URL,
          BOOKMARK_PROP.TYPE,
          BOOKMARK_PROP.TITLE,
          BOOKMARK_PROP.AUTHOR,
          BOOKMARK_PROP.WIDTH,
          BOOKMARK_PROP.HEIGHT,
          BOOKMARK_PROP.DURATION
        ]);
        state.errors = this.validate(state);
        this.setState(state as any);
      });
    }
  }

  isStringEmpty = (val?: string) => {
    return !val || val.trim().length === 0;
  };

  getNewStateValOrDefault = (
    state: Partial<BookmarkPageState>,
    changedProps: BOOKMARK_PROP[],
    prop: BOOKMARK_PROP
  ) => {
    return changedProps.indexOf(prop) !== -1 ? state[prop] : this.state[prop];
  };

  checkCompleted = (state: Partial<BookmarkPageState>, changedProps: BOOKMARK_PROP[]) => {
    const url = this.getNewStateValOrDefault(state, changedProps, BOOKMARK_PROP.URL) as string;
    const thumbURL = this.getNewStateValOrDefault(
      state,
      changedProps,
      BOOKMARK_PROP.THUMB_URL
    ) as string;
    const title = this.getNewStateValOrDefault(state, changedProps, BOOKMARK_PROP.TITLE) as string;
    const author = this.getNewStateValOrDefault(
      state,
      changedProps,
      BOOKMARK_PROP.AUTHOR
    ) as string;
    const width = this.getNewStateValOrDefault(state, changedProps, BOOKMARK_PROP.WIDTH);
    const height = this.getNewStateValOrDefault(state, changedProps, BOOKMARK_PROP.HEIGHT);

    let completed =
      !this.isStringEmpty(url) &&
      !this.isStringEmpty(thumbURL) &&
      !this.isStringEmpty(title) &&
      !this.isStringEmpty(author) &&
      width !== undefined &&
      height !== undefined;

    // check completed status
    const type = this.getNewStateValOrDefault(state, changedProps, BOOKMARK_PROP.TYPE);
    if (type === BookmarkType.Video) {
      completed =
        completed &&
        this.getNewStateValOrDefault(state, changedProps, BOOKMARK_PROP.DURATION) !== undefined;
    }
    return completed;
  };

  /**
   * Validate bookmark settings.
   *
   * @memberof BookmarkPage
   */
  validate = (state: Partial<BookmarkPageState>) => {
    const { width, height, type, duration, url, thumbURL } = state;
    const errors = {};
    if (width !== undefined && width < 0) {
      errors[BOOKMARK_PROP.WIDTH] = i18n.t('width.errors.invalid');
    }
    if (height !== undefined && height < 0) {
      errors[BOOKMARK_PROP.HEIGHT] = i18n.t('height.errors.invalid');
    }
    if (type === BookmarkType.Video && duration !== undefined && duration < 0) {
      errors[BOOKMARK_PROP.DURATION] = i18n.t('duration.errors.invalid');
    }
    if (url && !validUrl.isWebUri(url)) {
      errors[BOOKMARK_PROP.URL] = i18n.t('url.errors.invalid');
    }
    if (thumbURL && !validUrl.isWebUri(thumbURL)) {
      errors[BOOKMARK_PROP.THUMB_URL] = i18n.t('thumb.errors.invalid');
    }
    return errors;
  };

  /**
   *
   *
   * @memberof BookmarkPage
   */
  onPropertyChange = (state: Partial<BookmarkPageState>, changedProps: BOOKMARK_PROP[]) => {
    // delete errors if any
    const errors = Object.assign({}, this.state.errors);
    for (const prop of changedProps) {
      if (this.state.errors && prop in this.state.errors) {
        delete errors[prop];
      }
    }
    state.errors = errors;
    state.completed = this.checkCompleted(state, changedProps);

    this.setState(state as any);
  };

  handleUrlChange = (event: any) => {
    const state: Partial<BookmarkPageState> = Object.assign({}, this.state);
    state.url = event.target.value;
    this.onPropertyChange(state, [BOOKMARK_PROP.URL]);
  };
  handleThumbURLChange = (event: any) => {
    const state: Partial<BookmarkPageState> = Object.assign({}, this.state);
    state.thumbURL = event.target.value;
    this.onPropertyChange(state, [BOOKMARK_PROP.THUMB_URL]);
  };
  handleAuthorChange = (event: any) => {
    const state: Partial<BookmarkPageState> = Object.assign({}, this.state);
    state.authorName = event.target.value;
    this.onPropertyChange(state, [BOOKMARK_PROP.AUTHOR]);
  };

  handleTitleChange = (event: any) => {
    const state: Partial<BookmarkPageState> = Object.assign({}, this.state);
    state.title = event.target.value;
    this.onPropertyChange(state, [BOOKMARK_PROP.TITLE]);
  };

  handleWidthChange = (event: any) => {
    const state: Partial<BookmarkPageState> = Object.assign({}, this.state);
    state.width = parseInt(event.target.value, 10);
    this.onPropertyChange(state, [BOOKMARK_PROP.WIDTH]);
  };

  handleHeightChange = (event: any) => {
    const state: Partial<BookmarkPageState> = Object.assign({}, this.state);
    state.height = parseInt(event.target.value, 10);
    this.onPropertyChange(state, [BOOKMARK_PROP.HEIGHT]);
  };

  handleTypeChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const state: Partial<BookmarkPageState> = Object.assign({}, this.state);
    state.type = parseInt(event.target.value, 10);
    this.onPropertyChange(state, [BOOKMARK_PROP.TYPE]);
  };

  handleDurationChange = (event: any) => {
    const state: Partial<BookmarkPageState> = Object.assign({}, this.state);
    state.duration = parseInt(event.target.value, 10);
    this.onPropertyChange(state, [BOOKMARK_PROP.DURATION]);
  };
  handleMouseURL = (event: any) => {
    event.preventDefault();
  };

  handleClickURL = () => {
    if (this.state.url && this.state.url.match('vimeo')) {
      VimeoConnector.sharedInstance.findVideoInfo4Url(this.state.url!).then(res => {
        if (res) {
          this.onPropertyChange(
            {
              type: BookmarkType.Video,
              title: res.title,
              width: res.width,
              height: res.height,
              duration: res.duration,
              authorName: res.author,
              thumbURL: res.thumbURL
            },
            [
              BOOKMARK_PROP.TYPE,
              BOOKMARK_PROP.TITLE,
              BOOKMARK_PROP.WIDTH,
              BOOKMARK_PROP.HEIGHT,
              BOOKMARK_PROP.DURATION,
              BOOKMARK_PROP.AUTHOR,
              BOOKMARK_PROP.THUMB_URL
            ]
          );
        }
      });
    } else if (this.state.url && this.state.url.match('flickr')) {
      FlickrConnector.sharedInstance.findImageInfo4Url(this.state.url!).then(res => {
        if (res) {
          this.onPropertyChange(
            {
              type: BookmarkType.Image,
              title: res.title,
              width: res.width,
              height: res.height,
              authorName: res.author,
              thumbURL: res.thumbURL
            },
            [
              BOOKMARK_PROP.TYPE,
              BOOKMARK_PROP.TITLE,
              BOOKMARK_PROP.WIDTH,
              BOOKMARK_PROP.HEIGHT,
              BOOKMARK_PROP.AUTHOR,
              BOOKMARK_PROP.THUMB_URL
            ]
          );
        }
      });
    }
  };

  onSubmit = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();

    const errors = this.validate(this.state);
    if (errors && Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    const { bookmark } = this.state;
    let promise: Promise<Bookmark>;
    if (!bookmark) {
      if (this.state.type === BookmarkType.Video) {
        promise = BookmarkApiFactory.defaultFactory.bookmarkApi.newVideoBookmark({
          url: this.state.url!,
          thumbURL: this.state.thumbURL!,
          tags: this.state.tags,
          title: this.state.title!,
          authorName: this.state.authorName!,
          width: this.state.width!,
          height: this.state.height!,
          duration: this.state.duration!
        });
      } else {
        promise = BookmarkApiFactory.defaultFactory.bookmarkApi.newImageBookmark({
          url: this.state.url!,
          thumbURL: this.state.thumbURL!,
          tags: this.state.tags,

          title: this.state.title!,
          authorName: this.state.authorName!,
          width: this.state.width!,
          height: this.state.height!
        });
      }
    } else {
      bookmark.url = this.state.url!;
      bookmark.thumbURL = this.state.thumbURL!;
      bookmark.title = this.state.title!;
      bookmark.authorName = this.state.authorName!;
      bookmark.tags = this.state.tags;
      if (bookmark.type === BookmarkType.Video) {
        // tslint:disable-next-line:variable-name
        const _video = bookmark as VideoBookmark;
        _video.width = this.state.width!;
        _video.height = this.state.height!;
        _video.duration = this.state.duration!;
      } else {
        // tslint:disable-next-line:variable-name
        const _image = bookmark as ImageBookmark;
        _image.width = this.state.width!;
        _image.height = this.state.height!;
      }
      promise = BookmarkApiFactory.defaultFactory.bookmarkApi.save(bookmark);
    }

    this.setState({ saving: true });
    promise
      .then(() => {
        this.props.history.goBack();
      })
      .catch(err => {
        // TODO
        this.setState({ saving: false });
      });
  };

  renderTextInput = (prop: BOOKMARK_PROP, props: any) => {
    const { classes } = this.props;

    return (
      <TextField
        id={prop}
        value={this.state[prop] || ''}
        required
        fullWidth
        margin="normal"
        inputProps={{ name: prop }}
        {...props}
        className={classes.input}
        error={this.state.errors && prop in this.state.errors}
        helperText={this.state.errors && prop in this.state.errors ? this.state.errors[prop] : null}
      />
    );
  };

  /**
   * Creates a new tag with given label and associate it to given bookbark.
   * Associate tag with bookmark if a tag already exists with the same name
   * @memberof BookmarkPage
   */
  onNewTag = (tag: Tag) => {
    const tags = this.state.tags ? this.state.tags.slice(0) : [];
    if (tags.filter(t => t.id === tag.id).length > 0) return;
    tags.push(tag);
    this.setState({ tags });
  };

  onDeleteTag = (tag: Tag) => {
    let tags = this.state.tags || [];
    tags = tags.filter(t => t.id !== tag.id);
    this.setState({ tags });
  };

  render() {
    const { loading } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.content}>
        <Toolbar disableGutters className={classes.breadcrumbs}>
          <Typography variant="title">
            <Link to="/" className={classes.link}>
              {i18n.t('home.label')}
            </Link>
          </Typography>

          <KeyboardArrowRight style={{ marginLeft: 10, marginRight: 10 }} />

          <Typography variant="title">
            {this.props.match.params.id && this.state.bookmark && this.state.bookmark.title}
            {!this.props.match.params.id && i18n.t('new.label')}
          </Typography>
        </Toolbar>

        {this.state.bookmark && (
          <Typography variant="subheading">
            {i18n.t('bookmark.addedAt.value', {
              date: moment(this.state.bookmark.addedAt).calendar()
            })}
          </Typography>
        )}

        <form className={classes.form} onSubmit={this.onSubmit} noValidate>
          {loading && <CircularProgress />}
          <FormControl
            fullWidth
            required
            className={classes.input}
            error={this.state.errors && BOOKMARK_PROP.URL in this.state.errors}
          >
            <InputLabel htmlFor="adornment-url">{i18n.t('url.label')}</InputLabel>

            <Input
              id="adornment-url"
              name="url"
              value={this.state.url || ''}
              onChange={this.handleUrlChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    title="refreshProps"
                    onClick={this.handleClickURL}
                    disabled={this.isStringEmpty(this.state.url)}
                    onMouseDown={this.handleMouseURL}
                  >
                    <Cached />
                  </IconButton>
                </InputAdornment>
              }
            />
            {this.state.errors &&
              BOOKMARK_PROP.URL in this.state.errors && (
                <FormHelperText>{this.state.errors[BOOKMARK_PROP.URL]}</FormHelperText>
              )}
          </FormControl>
          <FormControl
            fullWidth
            required
            margin="normal"
            className={classes.input}
            disabled={this.state.bookmark !== undefined}
          >
            <InputLabel htmlFor="age-simple">{i18n.t('type.label')}</InputLabel>
            <Select
              value={this.state.type}
              onChange={this.handleTypeChange}
              inputProps={{
                id: 'age-simple'
              }}
            >
              <MenuItem value={BookmarkType.Video}>{i18n.t('type.video')}</MenuItem>
              <MenuItem value={BookmarkType.Image}>{i18n.t('type.image')}</MenuItem>
            </Select>
          </FormControl>
          {this.renderTextInput(BOOKMARK_PROP.TITLE, {
            onChange: this.handleTitleChange,
            label: i18n.t('title.label')
          })}
          {this.renderTextInput(BOOKMARK_PROP.AUTHOR, {
            onChange: this.handleAuthorChange,
            label: i18n.t('author.label')
          })}
          {this.renderTextInput(BOOKMARK_PROP.THUMB_URL, {
            onChange: this.handleThumbURLChange,
            label: i18n.t('thumb.label')
          })}
          {this.renderTextInput(BOOKMARK_PROP.WIDTH, {
            onChange: this.handleWidthChange,
            label: i18n.t('width.label')
          })}
          {this.renderTextInput(BOOKMARK_PROP.HEIGHT, {
            onChange: this.handleHeightChange,
            label: i18n.t('height.label')
          })}
          {this.state.type === BookmarkType.Video &&
            this.renderTextInput(BOOKMARK_PROP.DURATION, {
              onChange: this.handleDurationChange,
              label: i18n.t('duration.label')
            })}
          <div className={classes.tagsContainer}>
            <Typography variant="subheading">{i18n.t('tags.label')}</Typography>
            {withRoot(withRouter(TagList), this.props.theme!)({
              tags: this.state.tags || [],
              onAdd: this.onNewTag,
              onDelete: this.onDeleteTag
            })}
          </div>
          <Button
            variant="raised"
            color="primary"
            type="submit"
            className={classes.submit}
            disabled={!this.state.completed || this.state.saving}
          >
            {i18n.t('save.label')}
          </Button>
        </form>
      </div>
    );
  }
}

const styles: StyleRulesCallback<StyledProp> = theme => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: 2 * theme.spacing.unit
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: '1 0 auto',
    width: '100%',
    margin: 'auto',
    maxWidth: 1280,
    padding: theme.spacing.unit * 2
  },
  submit: {
    alignSelf: 'center',
    marginTop: theme.spacing.unit * 2
  },
  input: {
    flexShrink: 0
  },
  breadcrumbs: {
    textTransform: 'uppercase'
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  },
  tagsContainer: {
    marginTop: 2 * theme.spacing.unit
  }
});

export default withStyles(styles)(BookmarkPage) as React.ComponentClass<
  BookmarkPageProps & Omit<BookmarkPageProps, keyof ClassNameMap<any>>
>;
