# Splyt Partner SDK

Partner wrapper over `@splytech-io/splyt-ws-connection` module

## Prerequisities

* Node >= v6.0.0 

## Installation

```bash
$ npm install @splytech-io/splyt-partner-sdk
```

## SplytPartnerSDK Class API

### constructor(serverUrl: String, credentials: Object)

Creates an instance of `SplytPartnerSDK`, connects and signs in the partner. In case if connection is dropped SDK reconnects and relogins into Splyt automatically.

### .request(method: String, data: Object): Promise
Sends a **request message** to the Splyt Backend and waits for the response. Once response is received a returned promise is resolved or rejected depending on a response message from the server. 

**Note:** promise might be rejected if SDK fails to deliver a message to the backend.

```js
const data = {
  login: 'username',
  password: 'password'
};

partner.request('partner.sign-in', data)
	.then(() => /* handle sucessfull response */)
	.catch((err) => /* handle erroneous response */);
```

### .push(method: String, data: Object): Promise
Sends a **push message** to the Splyt Backend. Function returns a Promise which is resolved if message is delivered to the server.

### .on(eventName: String, callbackFunction: Function): SplytPartnerSDK
All events are implemented using `@rainder/co-event-emitter` library. Only one event subscriber is allowed. It accepts [GeneratorFunctions](https://www.npmjs.com/package/co), [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [Thunks](https://www.npmjs.com/package/co#thunks) as callback functions. 

```js
partner.on('event-name', callbackFunction);
```

Every request or push message from Splyt Backend to the SDK is converted into event where **endpoint method name** is used as **event name**. You can subscribe to specific method calls as following:

```js
//example of GeneratorFunction usage as a callbackFunction
partner.on('endpoint-method-name', function *(data) {
  //handle request and send response
  
  return { response_data: 'some-data' };
});
```

If SDK receives a message to which you have not subscribed, SDK outputs a warning to the terminal.


###

## Implementation example

```js
const SplytPartnerSDK = require('@splytech-io/splyt-partner-sdk');

const partner = new SplytPartnerSDK.Client('wss://wsapi.sandbox.splytech.io', {
  login: 'username',
  password: 'password',
});

//ie using resolved Promise
partner.on('partner.journey.estimate', (data) => {
  //returns an estimate price of the journey
  
  return Promise.resolve({
    price_range: {
      lower: 1234,
      upper: 1566,
    }
  });
});

//ie using generator function
partner.on('partner.new-trip-request', function *(data) {
  if (data.passenger_groups[0].pickup.address === '83 Baker Street') {
    //sends an erroneous response to the Splyt Backend
    throw new SplytPartnerSDK.Error.BAD_REQUEST('invalid pickup address');
  }
  
  //make asynchronous calls
  const result = yield someExternalHttpCall(data);
  
  //sends successful response message to the server
  return { someData: result.data };
});

```
