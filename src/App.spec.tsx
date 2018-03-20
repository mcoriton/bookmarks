import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

import { withRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import BookmarkApiFactory, { LocalStorageBookmarkApiFactory } from './api/BookmarkApiFactory';
import InMemoryStorage from './api/localstorage/InMemoryStorage';

beforeAll(() => {
  BookmarkApiFactory.defaultFactory = new LocalStorageBookmarkApiFactory(new InMemoryStorage());
});

it('renders without crashing', () => {
  // tslint:disable-next-line:variable-name
  const AppWithRouter = withRouter(App);

  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
