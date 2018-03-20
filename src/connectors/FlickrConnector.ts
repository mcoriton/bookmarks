import * as request from 'request';
const API_KEY = 'b40faa224d167362a553c3c6a8821f4f';
// const API_SECRET = "7f7f1ef475369873";
/**
 * Flick connector for Flickr services
 *
 * @export
 * @class FlickrConnector
 */
export default class FlickrConnector {
  static sharedInstance: FlickrConnector = new FlickrConnector();
  // tslint:disable-next-line:max-line-length
  // https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=c657b858a1770a4b973310b295826329&photo_id=8320736073&format=json&nojsoncallback=1
  /**
   * Returns first thumb info (url,width,height) where width > 500
   *
   * @private
   * @param {string} id
   * @returns {(Promise<
   *     | {
   *         width: number;
   *         height: number;
   *         thumbURL: string;
   *       }
   *     | undefined
   *   >)}
   * @memberof FlickrConnector
   */
  // tslint:disable:ter-indent
  private getSize(
    id: string
  ): Promise<
    | {
        width: number;
        height: number;
        thumbURL: string;
      }
    | undefined
  > {
    // tslint:enable:ter-indent
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          url: 'https://api.flickr.com/services/rest/',
          json: true,
          qs: {
            api_key: API_KEY,
            photo_id: id,
            format: 'json',
            nojsoncallback: 1,
            method: 'flickr.photos.getSizes'
          }
        },
        (err, res, body) => {
          if (err) {
            reject(err);
            return;
          }

          let thumbUrl: string;
          for (const e of body.sizes.size) {
            if (e.width >= 500) {
              thumbUrl = e.source;
              break;
            }
          }
          resolve({
            width: parseInt(body.sizes.size[body.sizes.size.length - 1].width, 10),
            height: parseInt(body.sizes.size[body.sizes.size.length - 1].height, 10),
            thumbURL: thumbUrl!
          });
        }
      );
    });
  }
  // tslint:disable-next-line:max-line-length
  // https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=c657b858a1770a4b973310b295826329&photo_id=8320736073&format=json&nojsoncallback=1

  /**
   * Reurns image info for image which URL is given in parameter.
   * Rejects promise if image does not exist.
   *
   * @param {string} url
   * @returns {(Promise<
   *     | {
   *         title: string;
   *         width: number;
   *         height: number;
   *         author: string;
   *         thumbURL: string;
   *       }
   *     | undefined
   *   >)}
   * @memberof FlickrConnector
   */
  // tslint:disable:ter-indent
  findImageInfo4Url(
    url: string
  ): Promise<
    | {
        title: string;
        width: number;
        height: number;
        author: string;
        thumbURL: string;
      }
    | undefined
  > {
    // tslint:enable:ter-indent

    const re = /^https?:\/\/www.flickr.com\/photos\/.*\/([0-9]+)/;
    const match = re.exec(url);
    if (!match) return Promise.reject('URL not supported');

    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          url: 'https://api.flickr.com/services/rest/',
          json: true,
          qs: {
            api_key: API_KEY,
            photo_id: match![1],
            format: 'json',
            nojsoncallback: 1,
            method: 'flickr.photos.getInfo'
          }
        },
        (err, res, body) => {
          if (err) {
            reject(err);
            return;
          }

          this.getSize(match![1])
            .then(sizes => {
              resolve(
                Object.assign(
                  {
                    title: body.photo.title._content,
                    author: body.photo.owner.realname || body.photo.owner.username
                  },
                  sizes
                )
              );
            })
            .catch(err => {
              reject(err);
            });
        }
      );
    });
  }
}
