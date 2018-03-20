import * as request from 'request';

const CLIENT_ID = 'ae5d1c892e4a9f4f2d8d611b4b05a05f62186755';
const CLIENT_SECRET =
  // tslint:disable-next-line:max-line-length
  'e5aYy+6kIJwEa2+cFTbBJUpYtrU4uT9xWrGkmFrNe52FnZ22zu3x35m6FGQY96yTWh1f+4Uogo7DIuT75K2fM4seRxKDU32QTBEVm1HTYIzDfONl8ytgOYk4NZbUzDJ6';

/**
 * Connector for Video service
 *
 * @export
 * @class VimeoConnector
 */
export default class VimeoConnector {
  static sharedInstance: VimeoConnector = new VimeoConnector();

  // tslint:disable-next-line:variable-name
  private _accessToken?: string;

  /**
   * Get Vimeo Access token if needed
   *
   * @returns {Promise<string>}
   * @memberof VimeoConnector
   */
  public getAccessToken(): Promise<string> {
    if (this._accessToken) return Promise.resolve(this._accessToken);
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          url: 'https://api.vimeo.com/oauth/authorize/client?grant_type=client_credentials',
          json: true,
          headers: {
            Authorization: 'basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
          }
        },
        (err, res, body) => {
          if (err) {
            reject(err);
            return;
          }
          this._accessToken = body['access_token'];
          resolve(this._accessToken);
        }
      );
    });
  }

  /**
   * Returns Video info for given URL. Rejects promise if video cannot be found
   *
   * @param {string} url
   * @returns {(Promise<
   *     | {
   *         title: string;
   *         duration: number;
   *         width: number;
   *         height: number;
   *         author: string;
   *         thumbURL: string;
   *       }
   *     | undefined
   *   >)}
   * @memberof VimeoConnector
   */
  // tslint:disable:ter-indent

  findVideoInfo4Url(
    url: string
  ): Promise<
    | {
        title: string;
        duration: number;
        width: number;
        height: number;
        author: string;
        thumbURL: string;
      }
    | undefined
  > {
    // tslint:enable:ter-indent

    const re = /^https?:\/\/vimeo.com\/([0-9]+)$/;
    const match = re.exec(url);
    if (!match) return Promise.reject('URL not supported');

    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          url: 'https://api.vimeo.com/videos/' + match![1],
          json: true,
          headers: {
            Authorization: 'basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
          }
        },
        (err, res, body) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            title: body.name,
            duration: body.duration,
            width: body.width,
            height: body.height,
            author: body.user.name,
            thumbURL: body.pictures.sizes[body.pictures.sizes.length - 1].link
          });
        }
      );
    });
  }
}
