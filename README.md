# This is a Retell frontend demo written in react/nodejs.

`Warning: the intention of this repository is for demo purposes.` The "start button" initiates a websocket connection between the front end and Retell's server. It works for the demo but is risky for production as your Retell API key could be exposed publicly. It is suggested to establish a websocket connection with your backend, and another one between your backend and Retell server.

## Get Started
Replace `demoAgentId` `demoApiKey` below. You can find API key in https://beta.re-tell.ai/dashboard/, and create an agent there.

const demoAgentId = "YOUR_AGENT_ID";

const demoApiKey = "YOUR KEY";

###npm install

###npm start
