import * as React from 'react';
import { RouteComponentProps, Route, Switch, withRouter } from 'react-router';
import Home from './components/Home/Home';
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import blue from 'material-ui/colors/blue';
import red from 'material-ui/colors/red';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n'; // initialized i18next instance using reactI18nextModule
import BookmarkListPage from './components/BookmarkListPage/BookmarkListPage';
import withRoot from './withRoot';
import BookmarkPage from './components/BookmarkPage/BookmarkPage';
import TagPage from './components/TagPage/TagPage';

export interface AppState {}
export interface AppProps extends RouteComponentProps<any> {}
class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {};
  }

  render() {
    const theme = createMuiTheme({
      palette: {
        primary: blue,
        error: red
      }
    });

    // tslint:disable-next-line:variable-name
    const ThemedHome = (props: any) => {
      return withRoot(Home, theme)(props);
    };

    // tslint:disable-next-line:variable-name
    const HomeWithRouter = withRouter(ThemedHome);
    const home = () => (
      <HomeWithRouter>
        <Route path="/bookmark/:id?" component={withRoot(BookmarkPage, theme)} />
        <Route path="/" exact component={withRoot(BookmarkListPage, theme)} />
        <Route path="/tags/:id" component={withRoot(TagPage, theme)} />
      </HomeWithRouter>
    );
    // tslint:disable-next-line:variable-name
    const RouterSwitch = () => (
      <Switch>
        <Route path="/" component={home} />
      </Switch>
    );
    return (
      <I18nextProvider i18n={i18n}>
        <MuiThemeProvider theme={theme}>
          <RouterSwitch />
        </MuiThemeProvider>
      </I18nextProvider>
    );
  }
}

export default App;
