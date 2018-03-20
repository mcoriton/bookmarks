import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  Chip,
  WithStyles,
  withStyles,
  StyleRulesCallback,
  FormControl,
  Input,
  InputAdornment,
  IconButton,
  Omit
} from 'material-ui';
import { ClassNameMap } from 'material-ui/styles/withStyles';
import Tag from '../../model/Tag';
import Add from 'material-ui-icons/Add';
import BookmarkApiFactory from '../../api/BookmarkApiFactory';
import i18n from '../../i18n/i18n';

export declare type StyledProp = 'content' | 'tagList' | 'tag';

export interface TagListState {
  tagName?: string;
}
export interface TagListProps extends RouteComponentProps<any> {
  tags: Tag[];
  classes: ClassNameMap<StyledProp>;
  onAdd?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
  onSelect?: (tag: Tag) => void;
}

/**
 * Component for bookmark creation/edition
 */
class TagList extends React.Component<TagListProps & WithStyles<StyledProp>, TagListState> {
  constructor(props: TagListProps) {
    super(props);
    this.state = {};
  }

  handleClick = (tag: Tag) => {
    if (this.props.onSelect) {
      this.props.onSelect(tag);
    }
  };
  handleDelete = (tag: Tag) => {
    if (this.props.onDelete) {
      this.props.onDelete(tag);
    }
  };

  renderTag = (tag: Tag) => {
    const { classes } = this.props;
    return (
      <Chip
        key={tag.id}
        label={tag.label}
        className={classes.tag}
        onClick={() => this.handleClick(tag)}
        onDelete={() => this.handleDelete(tag)}
      />
    );
  };

  handleTagChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.setState({ tagName: e.target.value });
  };

  onSubmit = () => {
    if (this.state.tagName && this.state.tagName.trim().length > 0) {
      BookmarkApiFactory.defaultFactory.tagApi
        .newTagQueryBuilder()
        .label(this.state.tagName!)
        .query()
        .then(tags => {
          if (!tags || tags.length === 0) {
            return BookmarkApiFactory.defaultFactory.tagApi.newTag(this.state.tagName!);
          }
          return tags[0];
        })
        .then(tag => {
          this.setState({ tagName: '' });
          if (tag && this.props.onAdd) {
            this.props.onAdd!(tag);
          }
        });
    }
  };
  onKeyUp = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
      this.onSubmit();
    }
  };
  render() {
    const { classes, tags } = this.props;
    return (
      <div className={classes.content}>
        <FormControl fullWidth required>
          <Input
            value={this.state.tagName || ''}
            onChange={this.handleTagChange}
            onKeyDown={this.onKeyUp}
            placeholder={i18n.t('tag.placeholder')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  title="add"
                  onClick={this.onSubmit}
                  disabled={!this.state.tagName || this.state.tagName!.length === 0}
                >
                  <Add />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <div className={classes.tagList}>
          {tags.map(t => {
            return this.renderTag(t);
          })}
        </div>
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
  tagList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2 * theme.spacing.unit
  },
  tag: {
    marginRight: theme.spacing.unit
  }
});

export default withStyles(styles)(TagList) as React.ComponentClass<
  TagListProps & Omit<TagListProps, keyof ClassNameMap<any>>
>;
