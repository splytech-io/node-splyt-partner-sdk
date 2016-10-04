'use strict';

module.exports = {
  Connection: require('./lib/connection'),

  /**
   * @class SplytPartnerSDKError
   */
  Error: require('./lib/error'),
};

process.on('unhandledRejection', (err) => {
  console.warn('Unhandled rejection', err);
});