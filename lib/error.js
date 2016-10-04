'use strict';

class BaseSplytPartnerSDKError {
  /**
   * 
   * @param errno
   * @param errgr
   * @param message
   * @param description
   */
  constructor(errno, errgr, message, description) {
    this.errno = errno;
    this.errgr = errgr;
    this.message = message;
    this.description = description;
  }

  /**
   *
   * @param errno
   * @param errgr
   * @param message
   * @returns {{getMessage: (function(): *), new(*=): {}, getErrgr: (function(): *),
   *          getErrno: (function(): *), new(*, *, *, *): {}, create: (function(*=, *=, *=))}}
   */
  static create(errno, errgr, message) {
    return class SplytPartnerSDKError extends BaseSplytPartnerSDKError {
      constructor(description) {
        super(errno, errgr, message, description);
      }

      /**
       *
       * @returns {*}
       */
      static getErrno() {
        return errno;
      }

      /**
       *
       * @returns {*}
       */
      static getErrgr() {
        return errgr;
      }

      /**
       *
       * @returns {*}
       */
      static getMessage() {
        return message;
      }
    };
  }
}

module.exports = BaseSplytPartnerSDKError;

/**
 * @api-documentation error
 * @key BAD_REQUEST
 * @errno 100102
 * @errgr 400
 * @message Bad request
 */
BaseSplytPartnerSDKError.BAD_REQUEST = BaseSplytPartnerSDKError.create(
  100102, 400, 'Bad request'
);

/**
 * @api-documentation error
 * @key PARTNER_PRICING_TYPE_IS_NOT_SUPPORTED
 * @errno 100001
 * @errgr 400
 * @message Pricing type is not supported
 */
BaseSplytPartnerSDKError.PARTNER_PRICING_TYPE_IS_NOT_SUPPORTED = BaseSplytPartnerSDKError.create(
  100001, 400, 'Pricing type is not supported'
);

/**
 * @api-documentation error
 * @key PARTNER_PRICING_FAILURE
 * @errno 100002
 * @errgr 400
 * @message Estimation failure
 */
BaseSplytPartnerSDKError.PARTNER_PRICING_FAILURE = BaseSplytPartnerSDKError.create(
  100002, 400, 'Estimation failure'
);
