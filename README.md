# Retell web call demo (React and Node.js)

This demo uses the [Retell JavaScript SDK](https://github.com/RetellAI/retell-client-js-sdk)
to create and connect a browser voice call. The React app uses `RetellClient`;
its API requests go through the Node.js backend, which keeps your Retell API key
out of the browser. Audio connects directly to Retell using the call's token.

See the [web call guide](https://docs.retellai.com/deploy/web-call) for SDK options
and examples using a public key directly in the browser.

## Run the demo

Use Node.js 22 or newer and an agent from your Retell account.

### 1. Start the backend

```sh
cd example_backend
npm install
cp .env.example .env
```

Set `RETELL_API_KEY` in `.env` to your API key, then run:

```sh
npm start
```

The backend listens on `http://localhost:8080`. The `.env` file is ignored by Git.

### 2. Start the frontend

In another terminal:

```sh
cd frontend_demo
npm install
```

Replace `ENTER_YOUR_AGENT_ID` in `src/App.tsx` with your agent ID, then run:

```sh
npm start
```

Open `http://localhost:3000`, click **Start**, and allow microphone access.
The status changes from `connecting` to `live` after connection setup; audio
connectivity may follow. Click **Stop** to end the session. SDK-reported errors
appear below the button, and an ended session resets it to **Start**.

## How it works

- `RetellClient.createWebCall()` creates the call and connects its audio.
- The SDK's custom `fetch` sends API requests to the demo backend. The browser
  passes no API key; the backend adds its server-side credential.
- The backend forwards call creation to `POST /v3/create-web-call` and returns
  the connection details unchanged. It also forwards the SDK's stop request when
  a user cancels during creation.
- The React component keeps the session in a ref, handles `onStatus`, `onEnd`,
  and `onError`, and ends the session when it unmounts.

## Live transcripts and audio visualization

This demo shows audio calls and lifecycle hooks. It does not open a transcript
connection. The SDK's custom `fetch` only proxies REST requests, so adding
`transcript: true` here would leave the monitoring WebSocket without a credential.
To add live transcripts, relay the
[monitoring WebSocket](https://docs.retellai.com/api-references/monitor-call-websocket)
through your own authenticated backend, or use the
[public-key integration](https://docs.retellai.com/deploy/web-call#enable-live-transcripts).
Keep API keys out of browser code.

With transcript monitoring enabled, use `onTranscript` for the merged transcript
and `onNodeTransition` for conversation flow nodes. For an orb or volume meter,
enable `audio: { emitRawAudioSamples: true }` and use `onAudio` snapshots. Audio
levels estimate activity; transcripts do not provide exact speaking boundaries
or finalized-sentence events.

## Known limitation

Cancelling while call creation is in flight ends the session locally. If creation
then succeeds, the SDK sends a best-effort stop request that this backend proxies.
Microphone or connection setup failures also end the session locally, but SDK
3.0.1 does not send a stop request for those failures. In either case, a call that
nobody joined can stay in `registered` until the backend's not-joined timeout
clears it.
