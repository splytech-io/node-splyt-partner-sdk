'use strict';

const defer = require('@rainder/defer');
const CoEventEmitter = require('./co-event-emitter');
const SplytWSConnection = require('@splytech-io/splyt-ws-connection');

module.exports = class SplytPartnerSDKConnection extends CoEventEmitter {
  /**
   *
   * @param url
   * @param credentials {{ login, password }}
   */
  constructor(url, credentials) {
    super();

    this.credentials = credentials;
    this.logged_in = false;
    this.stack = [];
    this.connection = new SplytWSConnection(url);

    this.connection.on('connect', () => {
      this.logged_in = false;
      this._signIn();
    });

    this.connection.on('disconnect', () => {
      this.logged_in = false;
    });

    this.connection.on('push', (method, data) => {
      const handler = this.emit(method, data);

      if (!handler) {
        return console.warn(`Unhandled push message received '${method}'`);
      }

      handler
        .catch((err) => {
          if (err instanceof Error) {
            console.error(err);
          }
        });
    });

    this.connection.on('request', (method, data, cb) => {
      const handler = this.emit(method, data);

      if (!handler) {
        return console.warn(`Unhandled request message received '${method}'`);
      }

      handler
        .then((result) => cb(null, result))
        .catch((err) => {
          if (err instanceof Error) {
            console.error(err);
          }

          cb(err, null);
        });
    });
  }

  /**
   *
   * @private
   */
  _signIn() {
    this.connection.request('partner.sign-in', this.credentials)
      .then(() => {
        this.logged_in = true;
        this._flush();
      })
      .catch((e) => console.error(e));
  }

  /**
   *
   * @private
   */
  _flush() {
    if (!this.logged_in) {
      return;
    }

    for (const item of this.stack) {
      item.resolve();
    }

    this.stack.length = 0;
  }

  /**
   *
   * @param method
   * @param data
   * @returns {*}
   */
  request(method, data = {}) {
    if (this.logged_in) {
      return this.connection.request(method, data);
    }

    const dfd = defer();

    this.stack[this.stack.length] = dfd;

    return dfd.promise.then(() => this.connection.request(method, data));
  }

  /**
   *
   * @param method
   * @param data
   * @returns {*}
   */
  push(method, data = {}) {
    if (this.logged_in) {
      return this.connection.push(method, data);
    }

    const dfd = defer();

    this.stack[this.stack.length] = dfd;

    return dfd.promise.then(() => this.connection.push(method, data));
  }

};
