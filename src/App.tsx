import React, { useEffect, useState } from "react";
import "./App.css";
import { RetellClientSdk } from "retell-client-js-sdk";

const agentId = "Your_Agent_Id";

interface RegisterCallResponse {
  call_id?: string;
  sample_rate?: number;
}
const sdk = new RetellClientSdk();
const App = () => {
  const [isCalling, setIsCalling] = useState(false);

  // Initialize the SDK
  useEffect(() => {
    // Setup event listeners
    sdk.on("onConversationStarted", () => {
      console.log("Conversation started");
    });

    sdk.on("onConversationEnded", (reason) => {
      console.log("Conversation ended");
      setIsCalling(false); // Update button to "Start" when conversation ends
    });

    sdk.on("onError", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false); // Update button to "Start" in case of error
    });
  }, []);

  const toggleConversation = async () => {
    if (isCalling) {
      sdk.stopConversation();
    } else {
      const registerCallResponse = await registerCall(agentId);
      if (registerCallResponse.call_id) {
        sdk.startConversation({
          callId: registerCallResponse.call_id,
          sampleRate: registerCallResponse.sample_rate
        }).catch(console.error);
        setIsCalling(true); // Update button to "Stop" when conversation starts
      }
    }
  };

  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    try {
      // Replace with your server url
      const response = await fetch('http://localhost:8080/register-call-on-your-server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: RegisterCallResponse = await response.json();
      return data;
    } catch (err) {
      console.log(err)
      return {}; // Return an error
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={toggleConversation}>
          {isCalling ? "Stop" : "Start"}
        </button>
      </header>
    </div>
  );
};

export default App;
