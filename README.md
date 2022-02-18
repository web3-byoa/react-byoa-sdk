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

import ByoaSDK from 'byoa-sdk'
import 'byoa-sdk/dist/index.css'

class Example extends Component {
  render() {
    return <ByoaSDK />
  }
}
```

## Example metadata json
```json
{
  "version": "v0.1 (alpha)",
  "name": "Starkle",
  "description": "Starkle is a clone of the popular game Wordle. In this version all the words are related to Starkware, Ethereum, Layer 2's and technology!",
  "image": "ipfs://QmWhKghp3M4cerbQEBVPDgJWudgyq7rAVYLSbcPznf9T8c",
  "implementationURIs": {
    "browser": "https://starkle-app.byoa.org"
  },
  "substrates": [
    "browser"
  ]
}
```

## Props
### `mode`
`mode`: `l1` or `l2`. Defaults to `l2`. Represents where you want to source wallet details from.

### `byoaContractDetails`
#### `address`
String representing the L1 address on Ethereum for the byoa app registry contract.
#### `network`
What network the L1 address resides on.

### `alchemyConfiguration`
#### `url`
Connection url to source data from alchemy and read from contracts.

### `infuraConfiguration`
#### `id`
For wallet connect configuration.

### `starknetConfiguration`
#### `address`
The address on StarkNet for the deployed L2 contract.
#### `network`
The testnet/mainnet of StarkNet for the deployed L2 contract.

### `toggleExpandedView`
`boolean` that `true` means if you click the app icon again it toggles expanded view. If `false` clicking the app icon again does not toggle the view.


## Running
```
# development of sdk
yarn start

# Run the example page
cd ./example
yarn start
```

## Building
```
yarn build
```


## License

MIT © [pagreczner](https://github.com/pagreczner)
