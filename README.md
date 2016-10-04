# Splyt Partner SDK

Partner wrapper over `@splytech-io/splyt-ws-connection` module

```js
const SplytPartnerSDK = require('@splytech-io/splyt-partner-sdk');

const connection = new SplytPartnerSDK.Connection('wss://wsapi.sandbox.splytech.io', {
  login: 'username',
  password: 'password'
});

connection.on('request', (method, data, cb) => {
  if (method === 'partner.journey.estimate') {
    return cb(null, {
      price_range: {
        lower: 1000,
        upper: 1200
       }
    });
  }
});
```