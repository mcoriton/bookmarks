import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  AppBar,
  Typography,
  Toolbar,
  WithStyles,
  StyleRulesCallback,
  withStyles,
  Theme,
  Omit
} from 'material-ui';
import i18n from '../../i18n/i18n';
import { ClassNameMap } from 'material-ui/styles/withStyles';

export interface HomeState {}
export interface HomeProps extends RouteComponentProps<any> {
  theme: Theme;
  classes: ClassNameMap<StyledProp>;
}

export declare type StyledProp = 'appFrame' | 'content' | 'title';

class Home extends React.Component<HomeProps & WithStyles<StyledProp>, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {};
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.appFrame}>
        <AppBar>
          <Toolbar>
            <Typography variant="title" className={classes.title}>
              {i18n.t('app.title')}
            </Typography>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>{this.props.children}</div>
      </div>
    );
  }
}

const styles: StyleRulesCallback<StyledProp> = theme => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%'
  },
  title: {
    color: '#fff'
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    height: 'calc(100% - 56px)',
    marginTop: 56,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64
    }
  }
});
export default withStyles(styles)(Home) as React.ComponentClass<
  HomeProps & Omit<HomeProps, keyof ClassNameMap<any>>
>;
