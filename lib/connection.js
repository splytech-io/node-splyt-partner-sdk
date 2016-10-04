'use strict';

const defer = require('@rainder/defer');
const EventEmitter = require('events').EventEmitter;
const SplytWSConnection = require('@splytech-io/splyt-ws-connection');

module.exports = class SplytPartnerSDKConnection extends EventEmitter {
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
      this.emit('connect');
    });

    this.connection.on('disconnect', () => {
      this.logged_in = false;
      this.emit('disconnect');
    });

    this.connection.on('push', (...args) => this.emit('push', ...args));
    this.connection.on('request', (...args) => this.emit('request', ...args));
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
        this.emit('sign-in');
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

}