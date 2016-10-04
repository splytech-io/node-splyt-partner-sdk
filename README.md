# Splyt Partner SDK

Partner wrapper over `@splytech-io/splyt-ws-connection` module

```js
const SplytPartnerSDK = require('@splytech-io/splyt-partner-sdk');

const partner = new SplytPartnerSDK.Connection('wss://wsapi.sandbox.splytech.io', {
  login: 'username',
  password: 'password'
});

partner.on('partner.journey.estimate', function *(data) {
  return {
    price_range: {
      lower: 1234,
      upper: 1566
    }
  };
});

partner.on('partner.new-trip-request', function *(data) {
  if (data.passenger_groups[0].pickup.address === '83 Baker Street') {
    throw new SplytPartnerSDK.Error.BAD_REQUEST('invalid pickup address');
  }

  return {};
});

```