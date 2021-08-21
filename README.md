# byoa-sdk

> SDK for byoa functionality.

[![NPM](https://img.shields.io/npm/v/byoa-sdk.svg)](https://www.npmjs.com/package/byoa-sdk) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save byoa-sdk
```

## Usage

```tsx
import React, { Component } from 'react'

import MyComponent from 'byoa-sdk'
import 'byoa-sdk/dist/index.css'

class Example extends Component {
  render() {
    return <MyComponent />
  }
}
```

## Todo
- Have a stylable button that one can click to connect to wallet
- listen for wallet connect events from host
- fetch byoa's from a specific contract address
- load byoa metadata
- load a byoa onto the page
- unload a byoa from the page
- interface with the byoa with a common interface

## Example metadata json
```json
{
  "image": "ipfs://examplecidforimage",
  "byoa": {
    "browser" : {
      "uri" : "ipfs://examplefobrowseruri",
      "target": "classic"
    }
  }
}
```

## Running
1. Set up your local smart contract environment, see instructions in that repo
2. Create apps in your smart contract environment
3. Use app-store to add a smart contract to your account
4. run `npm start` in main directory here, then run `npm start` in `example` directory.


## License

MIT © [pagreczner](https://github.com/pagreczner)
