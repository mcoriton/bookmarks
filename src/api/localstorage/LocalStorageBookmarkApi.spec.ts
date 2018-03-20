import LocalStorageBookmarkApi from './LocalStorageBookmarkApi';
import VideoBookmark from '../../model/VideoBookmark';
import ImageBookmark from '../../model/ImageBookmark';
import InMemoryStorage from './InMemoryStorage';
let api: LocalStorageBookmarkApi;
let storage: InMemoryStorage;
beforeAll(() => {
  storage = new InMemoryStorage();
  api = new LocalStorageBookmarkApi(storage);
});

describe('Should create new video bookmark', () => {
  beforeAll(() => {
    storage.clear();
  });

  it('test 1', done => {
    api
      .newVideoBookmark({
        url: 'url',
        title: 'title',
        authorName: 'authorName',
        width: 1,
        height: 2,
        duration: 3,
        thumbURL: 'thumbURL'
      })
      .then(b => {
        expect(b).toBeTruthy();

        // Restore from local storage
        api
          .getById(b.id)
          .then(restored => {
            // tslint:disable-next-line:variable-name
            const _video = restored as VideoBookmark;
            expect(_video).toEqual(b);
            expect(_video.url).toEqual('url');
            expect(_video.title).toEqual('title');
            expect(_video.authorName).toEqual('authorName');
            expect(_video.thumbURL).toBe('thumbURL');
            expect(_video.width).toEqual(1);
            expect(_video.height).toEqual(2);
            expect(_video.duration).toEqual(3);
          })
          .then(() => {
            done();
          });
      });
  });
});

describe('Should create new image bookmark', () => {
  beforeAll(() => {
    storage.clear();
  });

  it('test 1', done => {
    api
      .newImageBookmark({
        url: 'url',
        title: 'title',
        authorName: 'authorName',
        thumbURL: 'thumbURL',
        width: 1,
        height: 2
      })
      .then(b => {
        expect(b).toBeTruthy();

        // Restore from local storage
        api
          .getById(b.id)
          .then(restored => {
            // tslint:disable-next-line:variable-name
            const _image = restored as ImageBookmark;
            expect(_image).toEqual(b);
            expect(_image.url).toEqual('url');
            expect(_image.title).toEqual('title');
            expect(_image.authorName).toEqual('authorName');
            expect(_image.thumbURL).toEqual('thumbURL');
            expect(_image.width).toEqual(1);
            expect(_image.height).toEqual(2);
          })
          .then(() => {
            done();
          });
      });
  });
});

describe('Should update bookmark', () => {
  beforeAll(() => {
    storage.clear();
  });

  it('test 1', done => {
    api
      .newImageBookmark({
        url: 'url',
        title: 'title',
        authorName: 'authorName',
        thumbURL: 'thumbURL',
        width: 1,
        height: 2
      })
      .then(b => {
        expect(b).toBeTruthy();
        // tslint:disable-next-line:variable-name
        let _image = b as ImageBookmark;

        b.url = 'url2';
        b.title = 'title2';
        b.authorName = 'authorName2';
        b.width = 2;
        b.height = 3;
        b.thumbURL = 'thumbURL2';

        api
          .save(b)
          .then(() => api.getById(b.id))
          .then(restored => {
            _image = restored as ImageBookmark;
            expect(_image).toEqual(b);
            expect(_image.url).toEqual('url2');
            expect(_image.title).toEqual('title2');
            expect(_image.authorName).toEqual('authorName2');
            expect(_image.thumbURL).toBe('thumbURL2');
            expect(_image.width).toEqual(2);
            expect(_image.height).toEqual(3);
          })
          .then(() => {
            done();
          });
      });
  });
});

describe('Should list bookmarks', () => {
  beforeAll(() => {
    storage.clear();

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
    return Promise.all(promises);
  });

  it('test 1', done => {
    api
      .newBookmarkQueryBuilder()
      .query()
      .then(res => {
        expect(res.length).toEqual(10);
        expect(res[0].url).toEqual('url#0');
        expect(res[9].url).toEqual('url#9');
        done();
      });
  });
});
