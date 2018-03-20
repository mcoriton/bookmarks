import VimeoConnector from './VimeoConnector';

let vimeoConnector: VimeoConnector;

beforeAll(() => {
  vimeoConnector = new VimeoConnector();
});

describe('Should get video info', () => {
  it('test 1', done => {
    vimeoConnector.findVideoInfo4Url('https://vimeo.com/259405501').then(res => {
      expect(res).toBeTruthy();
      expect(res).toEqual({
        width: 3840,
        height: 2074,
        duration: 779,
        title: 'Cuerdas en la vida- Ropes in life',
        author: 'Zzerardo González Pérez',
        thumbURL: 'https://i.vimeocdn.com/video/688329184_1280x720.jpg?r=pad'
      });
      done();
    });
  });
});
