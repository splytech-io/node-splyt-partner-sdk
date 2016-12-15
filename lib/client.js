'use strict';

const defer = require('@rainder/defer');
const CoEventEmitter = require('@rainder/co-event-emitter');
const SplytWSConnection = require('@splytech-io/splyt-ws-connection');
const debug = require('debug')('splytech-io:partner-sdk');

module.exports = class SplytPartnerSDK extends CoEventEmitter {
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

    this.connection.on('error', (err) => {
      console.error(`Error: ${err.message}`);
    });

    this.connection.on('push', (...args) => this._handlePush(...args));
    this.connection.on('request', (...args) => this._handleRequest(...args));
  }

  /**
   *
   * @param method
   * @param data
   * @returns {*}
   * @private
   */
  _handlePush(method, data) {
    debug('incoming push', method, data);

    if (!this.has(method)) {
      console.warn(`Unhandled push message received '${method}'`);

      return Promise.reject({ message: 'Not implemented' });
    }

    /* eslint prefer-reflect: 0 */
    return this.call(method, data).catch((err) => {
      if (err instanceof Error) {
        console.error(err);
      }
    });
  }

  /**
   *
   * @param method
   * @param data
   * @returns {*}
   * @private
   */
  _handleRequest(method, data) {
    debug('incoming request', method, data);

    if (!this.has(method)) {
      console.warn(`Unhandled request message received '${method}'`);

      return Promise.reject({ message: 'Not implemented' });
    }

    /* eslint prefer-reflect: 0 */
    return this.call(method, data).catch((err) => {
      if (err instanceof Error) {
        console.error(err);
      }

      return Promise.reject(err);
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
        this.emit('connection');
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
    debug('outgoing request', method, data);

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
    debug('outgoing push', method, data);

    if (this.logged_in) {
      return this.connection.push(method, data);
    }

    const dfd = defer();

    this.stack[this.stack.length] = dfd;

    return dfd.promise.then(() => this.connection.push(method, data));
  }
};
