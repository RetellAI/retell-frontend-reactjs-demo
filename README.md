# Retell Frontend Demo using Client SDK (React/Node.js)

## Context

This demo illustrates a quick setup for integrating a frontend with a backend using React and Node.js. It showcases using **our JS Client SDK**.


## Setup Tutorial

Watch our [video tutorial](https://docs.re-tell.ai/guide/quick-start-node) for a step-by-step guide on setting up both backend and frontend on your localhost in under 5 minutes.


## Get Started

Step 1:
`npm install retell-client-js-sdk`

Step 2:

```javascript
import { RetellClientSdk } from "retell-client-js-sdk";

const sdk = new RetellClientSdk();

// Call post-register-call at your server and return callId and sampleRate
// https://docs.re-tell.ai/api-references/post-register-call

// Start the conversation with the agent
sdk.startConversation({
        callId,
        sampleRate
})
```


Step 3:
`npm install`

Step 4:
`npm start`
