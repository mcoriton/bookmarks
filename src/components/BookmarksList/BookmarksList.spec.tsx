import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BookmarksList from './BookmarksList';

import { withRouter, Switch, MemoryRouter, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import BookmarkApiFactory, { LocalStorageBookmarkApiFactory } from '../../api/BookmarkApiFactory';
import InMemoryStorage from '../../api/localstorage/InMemoryStorage';
import withRoot from '../../withRoot';
import { createMuiTheme } from 'material-ui';
import blue from 'material-ui/colors/blue';
import red from 'material-ui/colors/red';
import * as TestUtils from 'react-dom/test-utils';
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import VimeoConnector from '../../connectors/VimeoConnector';
import FlickrConnector from '../../connectors/FlickrConnector';
import i18n from '../../i18n/i18n';
import { createMemoryHistory, Action, Location } from 'history';
import Bookmark, { BookmarkType } from '../../model/Bookmark';
import { BookmarkQueryBuilder } from '../../api/BookmarkApi';

Enzyme.configure({ adapter: new Adapter() });

let storage: InMemoryStorage;
let bookmarks: Bookmark[];
const createBookmarks = () => {
  const api = BookmarkApiFactory.defaultFactory.bookmarkApi;
  const promises: Promise<any>[] = [];
  for (let i = 0; i < 30; i += 1) {
    if (i % 2 === 0) {
      promises.push(
        api.newImageBookmark({
          url: 'url#' + i,
          title: 'title#' + i,
          authorName: 'authorName#' + i,
          thumbURL: 'thumbURL#' + i,
          width: i,
          height: i + 1
        })
      );
    } else {
      promises.push(
        api.newVideoBookmark({
          url: 'url#' + i,
          title: 'title#' + i,
          authorName: 'authorName#' + i,
          thumbURL: 'thumbURL#' + i,
          width: i,
          height: i + 1,
          duration: i + 2
        })
      );
    }
  }
  return Promise.all(promises).then(_bookmarks => {
    bookmarks = _bookmarks;
  });
};

beforeAll(() => {
  storage = new InMemoryStorage();
  BookmarkApiFactory.defaultFactory = new LocalStorageBookmarkApiFactory(storage);
  return createBookmarks();
});

it('renders without crashing', () => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRoot(BookmarksList, theme);
  const wrapper = Enzyme.mount(
    <MemoryRouter>
      <Component count={bookmarks.length} bookmarks={bookmarks.slice(0, 10)} />
    </MemoryRouter>
  );
});

it('Should display bookmarks', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRoot(BookmarksList, theme);

  const wrapper = Enzyme.mount(
    <MemoryRouter>
      <Component count={bookmarks.length} bookmarks={bookmarks.slice(0, 10)} />
    </MemoryRouter>
  );

  expect(wrapper.find('Card').length).toBe(10);

  const last = wrapper.find('Card').at(9);
  expect(last.find('h2').text()).toBe('title#9');
  let foundAuthor = false;
  let foundWidth = false;
  let foundHeight = false;
  last.find('li').map(anLi => {
    const text = anLi.text();
    if (text.match(/Auteur/)) {
      expect(text).toBe('Auteur : authorName#9');
      foundAuthor = true;
    } else if (text.match(/Largeur/)) {
      expect(text).toBe('Largeur : 9');
      foundWidth = true;
    } else if (text.match(/Hauteur/)) {
      expect(text).toBe('Hauteur : 10');
      foundHeight = true;
    }
  });
  expect(foundWidth && foundHeight && foundAuthor).toBeTruthy();
  done();
});

it('Should paginate', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRoot(BookmarksList, theme);

  let called = false;
  const paginate = () => {
    called = true;
  };
  const wrapper = Enzyme.mount(
    <MemoryRouter>
      <Component
        count={bookmarks.length}
        bookmarks={bookmarks.slice(0, 10)}
        onPaginateNext={paginate}
      />
    </MemoryRouter>
  );

  expect(wrapper.find('Card').length).toBe(10);
  (wrapper.find('ul[onScroll]').prop('onScroll') as any)({
    nativeEvent: {
      srcElement: {
        clientHeight: 500,
        scrollTop: 400
      }
    }
  });

  expect(called).toBeTruthy();

  done();
});

it('Should edit', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRoot(BookmarksList, theme);

  const wrapper = Enzyme.mount(
    <MemoryRouter>
      <Component count={bookmarks.length} bookmarks={bookmarks.slice(0, 10)} />
    </MemoryRouter>
  );

  const spy = spyOn(wrapper.find('BookmarksList').prop('history'), 'push');
  wrapper
    .find('Card')
    .find('button')
    .at(1)
    .simulate('click');
  wrapper.update();

  expect(spy.calls.count()).toBe(1);
  done();
});

it('Should delete', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRoot(BookmarksList, theme);

  let called = false;
  const paginate = () => {
    called = true;
  };
  const wrapper = Enzyme.mount(
    <MemoryRouter>
      <Component count={bookmarks.length} bookmarks={bookmarks.slice(0, 10)} onDelete={paginate} />
    </MemoryRouter>
  );

  expect(wrapper.find('Card').length).toBe(10);
  wrapper.update();
  wrapper
    .find('Card')
    .find('button')
    .at(0)
    .simulate('click');

  expect(called).toBeTruthy();

  done();
});
