import React, { useEffect, useRef, useState } from "react";
import { RetellClient, type WebCallSession } from "retell-client-js-sdk";
import "./App.css";

const agentId = "ENTER_YOUR_AGENT_ID";

const client = new RetellClient({
  key: "", // The backend adds the real credential; the browser never holds one.
  // Not `baseURL`: the SDK also uses that host for WebRTC signaling, so the
  // gateway transport would send /webrtc-proxy requests to this demo backend.
  fetch: (input, init) => {
    const url = new URL(input.toString());
    const headers = new Headers(init?.headers);
    headers.delete("Authorization");
    return fetch(`http://localhost:8080${url.pathname}${url.search}`, {
      ...init,
      headers,
    });
  },
});

const App = () => {
  const callRef = useRef<WebCallSession | null>(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      const call = callRef.current;
      callRef.current = null;
      call?.removeAllListeners();
      void call?.end();
    };
  }, []);

  const toggleConversation = async () => {
    const currentCall = callRef.current;
    if (currentCall && currentCall.status !== "ended") {
      await currentCall.end();
      return;
    }

    setError(null);
    setStatus("connecting");
    callRef.current = client.createWebCall({
      agent_id: agentId,
      // Optional: metadata: { customer_id: "customer_123" },
      // Optional: retell_llm_dynamic_variables: { customer_name: "John" },
      hooks: {
        onStatus: setStatus,
        onEnd: () => {
          callRef.current = null;
        },
        onError: (callError) => {
          console.error("Call error:", callError.message);
          setError(callError.message);
        },
      },
    });
  };

  const isCalling = status === "connecting" || status === "live";

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={toggleConversation}>
          {isCalling ? "Stop" : "Start"}
        </button>
        <p role="status">{status}</p>
        {error && <p role="alert">{error}</p>}
      </header>
    </div>
  );
};

export default App;
