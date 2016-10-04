'use strict';

const co = require('co');

module.exports = class CoEventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   *
   * @param eventName
   * @param cb
   */
  on(eventName, cb) {
    this.events[eventName] = cb;
    
    return this;
  }

  /**
   *
   * @param eventName
   * @param args
   * @returns {boolean}
   */
  emit(eventName, ...args) {
    if (!Reflect.apply(Object.prototype.hasOwnProperty, this.events, [eventName])) {
      return false;
    }

    return co(this.events[eventName](...args));
  }
};
