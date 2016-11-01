'use strict';

module.exports = {
  Client: require('./lib/client'),

  /**
   * @class SplytPartnerSDKError
   */
  Error: require('./lib/error'),
};

process.on('unhandledRejection', (err) => {
  console.warn('Unhandled rejection', err);
});