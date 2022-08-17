import React from 'react'

import { ByoaSDK } from 'byoa-sdk'
import 'byoa-sdk/dist/index.css'

const App = () => {
  return (
    <div>
      <h1 style={{textAlign: 'center'}}>BYOA Landing Page - Starknet Version</h1>
      <p style={{textAlign: 'center'}}> - connect your argent wallet to begin -</p>
      <ByoaSDK 
      />
    </div>
    
  );
}

export default App
