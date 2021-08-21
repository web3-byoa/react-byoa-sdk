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


## License

MIT © [pagreczner](https://github.com/pagreczner)
