import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BookmarkPage from './BookmarkPage';

import { withRouter } from 'react-router';
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
import { createMemoryHistory } from 'history';
import { BookmarkType } from '../../model/Bookmark';
let storage: InMemoryStorage;
Enzyme.configure({ adapter: new Adapter() });

const getURLInput = (component: Enzyme.ReactWrapper) => {
  return component.find('input[name="url"]');
};

const getThumbURLInput = (component: Enzyme.ReactWrapper) => {
  return component.find('input[name="thumbURL"]');
};

const getWidthInput = (component: Enzyme.ReactWrapper) => {
  return component.find('input[name="width"]');
};

const getHeightInput = (component: Enzyme.ReactWrapper) => {
  return component.find('input[name="height"]');
};

const getDurationInput = (component: Enzyme.ReactWrapper) => {
  return component.find('input[name="duration"]');
};
const getAuthorInput = (component: Enzyme.ReactWrapper) => {
  return component.find('input[name="authorName"]');
};
const getTitleInput = (component: Enzyme.ReactWrapper) => {
  return component.find('input[name="title"]');
};
const getSubmitButton = (component: Enzyme.ReactWrapper) => {
  return component.find('button[type="submit"]');
};
const getRefreshPropsButton = (component: Enzyme.ReactWrapper) => {
  return component.find('button[title="refreshProps"]');
};

beforeAll(() => {
  storage = new InMemoryStorage();
  BookmarkApiFactory.defaultFactory = new LocalStorageBookmarkApiFactory(storage);
});

it('renders without crashing', () => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRouter(withRoot(BookmarkPage, theme));
  const wrapper = Enzyme.mount(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );

  const url = getURLInput(wrapper);
  expect(url.exists()).toBeTruthy();
  const thumbURL = getThumbURLInput(wrapper);
  expect(thumbURL.exists()).toBeTruthy();
  const width = getWidthInput(wrapper);
  expect(width.exists()).toBeTruthy();
  const height = getHeightInput(wrapper);
  expect(height.exists()).toBeTruthy();
  const duration = getDurationInput(wrapper);
  expect(duration.exists()).toBeFalsy(); // By default image
  const author = getAuthorInput(wrapper);
  expect(author.exists()).toBeTruthy();
  const title = getTitleInput(wrapper);
  expect(title.exists()).toBeTruthy();
  const submit = getSubmitButton(wrapper);
  expect(submit.exists()).toBeTruthy();
  expect(submit.prop('disabled')).toBeTruthy(); // disabled by default
  const refresh = getRefreshPropsButton(wrapper);
  expect(refresh.exists()).toBeTruthy();
  expect(refresh.prop('disabled')).toBeTruthy(); // disabled by default
});

it('test update from vimeo url', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRouter(withRoot(BookmarkPage, theme));
  const wrapper = Enzyme.mount(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );

  const url = getURLInput(wrapper);
  url.simulate('change', { target: { value: 'https://vimeo.com/258358902' } });
  const refresh = getRefreshPropsButton(wrapper);
  expect(refresh.prop('disabled')).toBeFalsy();
  const response = Promise.resolve({
    title: 'title',
    width: 1,
    height: 2,
    duration: 3,
    author: 'author',
    thumbURL: 'thumbURL'
  });
  const mock = jest.fn().mockReturnValue(response);
  VimeoConnector.sharedInstance.findVideoInfo4Url = mock;
  refresh.simulate('click');
  response.then(res => {
    wrapper.update();
    const thumbURL = getThumbURLInput(wrapper);
    expect(thumbURL.prop('value')).toBe('thumbURL');
    const title = getTitleInput(wrapper);
    expect(title.prop('value')).toBe('title');
    const author = getAuthorInput(wrapper);
    expect(author.prop('value')).toBe('author');
    const width = getWidthInput(wrapper);
    expect(width.prop('value')).toBe(1);
    const height = getHeightInput(wrapper);
    expect(height.prop('value')).toBe(2);
    const duration = getDurationInput(wrapper);
    expect(duration.prop('value')).toBe(3);
    const submit = getSubmitButton(wrapper);
    expect(submit.prop('disabled')).toBeFalsy();
    done();
  });
});

it('test update from flickr url', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRouter(withRoot(BookmarkPage, theme));
  const wrapper = Enzyme.mount(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );

  const url = getURLInput(wrapper);
  url.simulate('change', {
    target: { value: 'https://www.flickr.com/photos/paxamik/15238830993' }
  });
  const refresh = getRefreshPropsButton(wrapper);
  expect(refresh.prop('disabled')).toBeFalsy();
  const response = Promise.resolve({
    title: 'title',
    width: 1,
    height: 2,
    author: 'author',
    thumbURL: 'thumbURL'
  });
  const mock = jest.fn().mockReturnValue(response);
  FlickrConnector.sharedInstance.findImageInfo4Url = mock;

  refresh.simulate('click');
  response.then(() => {
    wrapper.update();
    const thumbURL = getThumbURLInput(wrapper);
    expect(thumbURL.prop('value')).toBe('thumbURL');

    const title = getTitleInput(wrapper);
    expect(title.prop('value')).toBe('title');
    const author = getAuthorInput(wrapper);
    expect(author.prop('value')).toBe('author');
    const width = getWidthInput(wrapper);
    expect(width.prop('value')).toBe(1);
    const height = getHeightInput(wrapper);
    expect(height.prop('value')).toBe(2);
    const duration = getDurationInput(wrapper);
    expect(duration.exists()).toBeFalsy();
    const submit = getSubmitButton(wrapper);
    expect(submit.prop('disabled')).toBeFalsy();
    done();
  });
});

it('test submit disablement', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRouter(withRoot(BookmarkPage, theme));
  const wrapper = Enzyme.mount(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );

  const url = getURLInput(wrapper);
  url.simulate('change', { target: { value: 'https://vimeo.com/258358902' } });
  const refresh = getRefreshPropsButton(wrapper);
  expect(refresh.prop('disabled')).toBeFalsy();
  const response = Promise.resolve({
    title: 'title',
    width: 1,
    height: 2,
    duration: 3,
    author: 'author',
    thumbURL: 'thumbURL'
  });
  const mock = jest.fn().mockReturnValue(response);
  VimeoConnector.sharedInstance.findVideoInfo4Url = mock;

  refresh.simulate('click');
  response.then(() => {
    wrapper.update();
    const thumbURL = getThumbURLInput(wrapper);
    const title = getTitleInput(wrapper);
    const author = getAuthorInput(wrapper);
    const width = getWidthInput(wrapper);
    const height = getHeightInput(wrapper);
    const duration = getDurationInput(wrapper);
    const submit = getSubmitButton(wrapper);
    expect(submit.prop('disabled')).toBeFalsy();

    for (const e of [url, thumbURL, author, title, width, duration, height]) {
      e.simulate('change', { target: { value: '' } });
      expect(submit.prop('disabled')).toBeFalsy();
      e.simulate('change', { target: { value: 'a' } });
      expect(submit.prop('disabled')).toBeFalsy();
    }
    done();
  });
});

it('test error management', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRouter(withRoot(BookmarkPage, theme));
  const wrapper = Enzyme.mount(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );

  const url = getURLInput(wrapper);
  url.simulate('change', { target: { value: 'https://vimeo.com/258358902' } });
  const refresh = getRefreshPropsButton(wrapper);
  expect(refresh.prop('disabled')).toBeFalsy();
  const response = Promise.resolve({
    title: 'title',
    width: 1,
    height: 2,
    duration: 3,
    author: 'author',
    thumbURL: 'https://i.vimeocdn.com/video/686521773_1280x719.jpg?r=pad'
  });
  const mock = jest.fn().mockReturnValue(response);
  VimeoConnector.sharedInstance.findVideoInfo4Url = mock;

  refresh.simulate('click');
  response.then(() => {
    wrapper.update();
    const thumbURL = getThumbURLInput(wrapper);
    const title = getTitleInput(wrapper);
    const author = getAuthorInput(wrapper);
    const width = getWidthInput(wrapper);
    const height = getHeightInput(wrapper);
    const duration = getDurationInput(wrapper);
    const submit = getSubmitButton(wrapper);

    width.simulate('change', { target: { value: '-1' } });
    wrapper.find('form').simulate('submit');
    expect(
      wrapper
        .find('p')
        .filterWhere(e => e.text() === i18n.t('width.errors.invalid'))
        .exists()
    ).toBeTruthy();
    width.simulate('change', { target: { value: '1' } });
    expect(
      wrapper
        .find('p')
        .filterWhere(e => e.text() === i18n.t('width.errors.invalid'))
        .exists()
    ).toBeFalsy();

    height.simulate('change', { target: { value: '-1' } });
    wrapper.find('form').simulate('submit');
    expect(
      wrapper
        .find('p')
        .filterWhere(e => e.text() === i18n.t('height.errors.invalid'))
        .exists()
    ).toBeTruthy();
    height.simulate('change', { target: { value: '1' } });
    expect(
      wrapper
        .find('p')
        .filterWhere(e => e.text() === i18n.t('height.errors.invalid'))
        .exists()
    ).toBeFalsy();

    url.simulate('change', { target: { value: 'blob' } });
    wrapper.find('form').simulate('submit');
    expect(
      wrapper
        .find('p')
        .filterWhere(e => e.text() === i18n.t('url.errors.invalid'))
        .exists()
    ).toBeTruthy();
    url.simulate('change', {
      target: { value: 'https://vimeo.com/258358902' }
    });
    expect(
      wrapper
        .find('p')
        .filterWhere(e => e.text() === i18n.t('url.errors.invalid'))
        .exists()
    ).toBeFalsy();

    thumbURL.simulate('change', { target: { value: 'blob' } });
    wrapper.find('form').simulate('submit');
    expect(
      wrapper
        .find('p')
        .filterWhere(e => e.text() === i18n.t('thumb.errors.invalid'))
        .exists()
    ).toBeTruthy();
    thumbURL.simulate('change', {
      target: { value: 'https://vimeo.com/258358902' }
    });
    expect(
      wrapper
        .find('p')
        .filterWhere(e => e.text() === i18n.t('thumb.errors.invalid'))
        .exists()
    ).toBeFalsy();

    done();
  });
});

it('test create bookmark', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });
  // tslint:disable-next-line:variable-name
  const Component = withRouter(withRoot(BookmarkPage, theme));
  const wrapper = Enzyme.mount(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );

  const url = getURLInput(wrapper);
  url.simulate('change', { target: { value: 'https://vimeo.com/258358902' } });
  const refresh = getRefreshPropsButton(wrapper);
  expect(refresh.prop('disabled')).toBeFalsy();
  const response = Promise.resolve({
    title: 'title',
    width: 1,
    height: 2,
    duration: 3,
    author: 'author',
    thumbURL: 'https://i.vimeocdn.com/video/686521773_1280x719.jpg?r=pad'
  });
  const mock1 = jest.fn().mockReturnValue(response);
  VimeoConnector.sharedInstance.findVideoInfo4Url = mock1;

  refresh.simulate('click');
  response.then(() => {
    wrapper.update();
    wrapper.find('form').simulate('submit');
    BookmarkApiFactory.defaultFactory.bookmarkApi
      .newBookmarkQueryBuilder()
      .count()
      .then(count => {
        expect(count).toBe(1);

        done();
      });
  });
});

it('test edit bookmark', done => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      error: red
    }
  });

  const response = Promise.resolve({
    url: 'https://vimeo.com/258358902',
    title: 'title',
    width: 1,
    height: 2,
    duration: 3,
    authorName: 'author',
    type: BookmarkType.Video,
    thumbURL: 'https://i.vimeocdn.com/video/686521773_1280x719.jpg?r=pad'
  });
  const mock1 = jest.fn().mockReturnValue(response);
  BookmarkApiFactory.defaultFactory.bookmarkApi.getById = mock1;

  // tslint:disable-next-line:variable-name
  const Component = (
    <BookmarkPage
      match={{ params: { id: '1' }, isExact: true, path: '', url: '' }}
      theme={createMuiTheme()}
      classes={{
        content: '',
        input: '',
        breadcrumbs: '',
        form: '',
        link: '',
        submit: '',
        tagsContainer: ''
      }}
      location={{
        pathname: '',
        search: '',
        state: '',
        hash: ''
      }}
      history={createMemoryHistory()}
    />
  );
  const wrapper = Enzyme.mount(<BrowserRouter>{Component}</BrowserRouter>);
  response.then(() => {
    wrapper.update();
    const url = getURLInput(wrapper);
    expect(url.prop('value')).toBe('https://vimeo.com/258358902');
    const thumbURL = getThumbURLInput(wrapper);
    expect(thumbURL.prop('value')).toBe(
      'https://i.vimeocdn.com/video/686521773_1280x719.jpg?r=pad'
    );
    const title = getTitleInput(wrapper);
    expect(title.prop('value')).toBe('title');
    const author = getAuthorInput(wrapper);
    expect(author.prop('value')).toBe('author');
    const width = getWidthInput(wrapper);
    expect(width.prop('value')).toBe(1);
    const height = getHeightInput(wrapper);
    expect(height.prop('value')).toBe(2);
    const duration = getDurationInput(wrapper);
    expect(duration.exists()).toBeTruthy();
    const submit = getSubmitButton(wrapper);
    expect(submit.prop('disabled')).toBeFalsy();
    done();
  });
});
