import InMemoryStorage from './InMemoryStorage';
import LocalStorageTagApi from './LocalStorageTagApi';
let api: LocalStorageTagApi;
let storage: InMemoryStorage;
beforeAll(() => {
  storage = new InMemoryStorage();
  api = new LocalStorageTagApi(storage);
});

describe('Should create new tag', () => {
  beforeAll(() => {
    storage.clear();
  });

  it('test 1', done => {
    api.newTag('label').then(tag => {
      expect(tag).toBeTruthy();

      // Restore from local storage
      api
        .getById(tag.id)
        .then(restored => {
          expect(restored.label).toBe('label');
        })
        .then(() => {
          done();
        });
    });
  });
});

describe('Should update tag', () => {
  beforeAll(() => {
    storage.clear();
  });

  it('test 1', done => {
    api.newTag('label').then(tag => {
      expect(tag).toBeTruthy();
      tag.label = 'label2';
      api
        .save(tag)
        .then(() => api.getById(tag.id))
        .then(restored => {
          expect(restored.label).toBe('label2');
        })
        .then(() => {
          done();
        });
    });
  });
});

describe('Should list tags', () => {
  beforeAll(() => {
    storage.clear();

    const promises: Promise<any>[] = [];
    for (let i = 0; i < 30; i += 1) {
      promises.push(api.newTag(`label#${i}`));
    }
    return Promise.all(promises);
  });

  it('test 1', done => {
    api
      .newTagQueryBuilder()
      .query()
      .then(res => {
        expect(res.length).toEqual(10);
        expect(res[0].label).toEqual('label#0');
        expect(res[9].label).toEqual('label#9');
        done();
      });
  });

  it('test with offset', done => {
    api
      .newTagQueryBuilder()
      .offset(2)
      .limit(6)
      .query()
      .then(res => {
        expect(res.length).toEqual(6);
        expect(res[0].label).toEqual('label#2');
        expect(res[5].label).toEqual('label#7');
        done();
      });
  });
});
