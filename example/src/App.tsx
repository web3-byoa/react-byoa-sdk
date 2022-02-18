import React from 'react'

import { ByoaSDK } from 'byoa-sdk'
import 'byoa-sdk/dist/index.css'

const App = () => {
  return (
    <div>
      <h1>Hello World</h1>
      {[...new Array(12)].map((_, i) => (
        <p key={`dummy-${i}`}>Hello again my friends</p>
      ))}
      <ByoaSDK 
      />
    </div>
    
  );
}

export default App
