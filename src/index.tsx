import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { withRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import BookmarkApiFactory, { LocalStorageBookmarkApiFactory } from './api/BookmarkApiFactory';
import * as moment from 'moment/moment';
BookmarkApiFactory.defaultFactory = new LocalStorageBookmarkApiFactory(window.localStorage);

// tslint:disable-next-line:variable-name
const AppWithRouter = withRouter(App);

moment.locale('fr');

ReactDOM.render(
  <BrowserRouter>
    <AppWithRouter />
  </BrowserRouter>,
  document.getElementById('root')
);
registerServiceWorker();
