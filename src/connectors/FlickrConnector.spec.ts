import FlickrConnector from './FlickrConnector';

let connector: FlickrConnector;

beforeAll(() => {
  connector = new FlickrConnector();
});

describe('Should get image info', () => {
  it('test 1', done => {
    connector
      .findImageInfo4Url(
        // tslint:disable-next-line:max-line-length
        'https://www.flickr.com/photos/moimarye/8320736073/in/photolist-ripTNt-dFgWWM-iJCHFi-VfG791-U5B6qH-pCqkkt-VfG8AE-V7y6Yv-jJZKi-XukRVE-jkzgRk-o6dnst-omKiYE-7x1XEN-aNGYEr-U2K1Eo-jkDvFh-LV3T9m-jkARhp-jkB3qM-jkDyGN-jsXaTn-jkBakt-jkzBnV-jkByQA-iJFph1-dCUZHw-815R6a-jkzjFD-jkB4Pi-jkzrqR-jkDCr1-UHY8xb-jkANFx-jkBzxN-jkzmkR-jkzF8R-jkB8f6-fED2z3-ruT7BE-NnKXnu-jkE5jU-dFnpjw-jkzJJt-kJHB94-d75Duf-kJGW8F-jkzMAF-jkBfwa-q9HKyE'
      )
      .then(res => {
        expect(res).toBeTruthy();
        expect(res).toEqual({
          title: 'Rennes',
          author: 'Marye',
          width: 600,
          height: 600,
          thumbURL: 'https://farm9.staticflickr.com/8077/8320736073_c0712bdbb8.jpg'
        });
        done();
      });
  });

  it('test with big images', done => {
    connector.findImageInfo4Url('https://www.flickr.com/photos/paxamik/15238830993').then(res => {
      expect(res).toBeTruthy();
      expect(res).toEqual({
        title: 'Brothers',
        author: 'Pascal Michaille',
        width: 4928,
        height: 3264,
        thumbURL: 'https://farm9.staticflickr.com/8612/15238830993_0343be2466.jpg'
      });
      done();
    });
  });
});
