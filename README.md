# Retell Frontend Demo using Client SDK (React/Node.js)

## Context

This demo illustrates a quick setup for integrating a frontend with a backend using React and Node.js. It showcases using **our JS Client SDK**. If you prefer using native JS implementation, check [Retell Frontend ReactJS Demo using native JS](https://github.com/adam-team/retell-frontend-reactjs-demo/) out instead.


## Setup Tutorial

Watch our [video tutorial](https://docs.re-tell.ai/guide/quick-start-node) for a step-by-step guide on setting up both backend and frontend on your localhost in under 5 minutes.


## Get Started

Step 1:
`npm install retell-client-js-sdk`

Step 2:
Replace `apiKey` `agentId` below. You can find API key in https://beta.re-tell.ai/dashboard/, and create an agent there or using API.

```javascript
import { RetellClientSdk } from "retell-client-js-sdk";

const sdk = new RetellClientSdk(apiKey);

// Start the conversation with the agent
sdk.startConversation({
        agentId,
})
```


Step 3:
`npm install`

Step 4:
`npm start`
