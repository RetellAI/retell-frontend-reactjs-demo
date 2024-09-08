import React, { useEffect, useState } from "react";
import "./App.css";
import { RetellWebClient } from "retell-client-js-sdk";

const agentId = process.env.REACT_APP_RETELL_AGENTID;

interface RegisterCallResponse {
  access_token: string;
}

const retellWebClient = new RetellWebClient();

const App = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [instructionsVisible, setInstructionsVisible] = useState(true);

  useEffect(() => {
    retellWebClient.on("call_started", () => {
      console.log("call started");
      setIsCalling(true);
      setInstructionsVisible(false);
    });

    retellWebClient.on("call_ended", () => {
      console.log("call ended");
      setIsCalling(false);
      setIsAgentSpeaking(false);
      setInstructionsVisible(true);
    });

    retellWebClient.on("agent_start_talking", () => {
      console.log("agent_start_talking");
      setIsAgentSpeaking(true);
    });

    retellWebClient.on("agent_stop_talking", () => {
      console.log("agent_stop_talking");
      setIsAgentSpeaking(false);
    });

    retellWebClient.on("audio", (audio) => {
      // Handle audio if needed
    });

    retellWebClient.on("update", (update) => {
      console.log("Received update", update);
    });

    retellWebClient.on("metadata", (metadata) => {
      console.log("Received metadata", metadata);
    });

    retellWebClient.on("error", (error) => {
      console.error("An error occurred:", error);
      retellWebClient.stopCall();
      setIsCalling(false);
      setIsAgentSpeaking(false);
    });
  }, []);

  const toggleConversation = async () => {
    if (isCalling) {
      retellWebClient.stopCall();
    } else {
      try {
        const registerCallResponse = await registerCall(agentId);
        if (registerCallResponse.access_token) {
          await retellWebClient.startCall({
            accessToken: registerCallResponse.access_token,
          });
        } else {
          console.error("No access token received");
        }
      } catch (error) {
        console.error("Error starting call:", error);
      }
    }
  };

  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    console.log("Registering call for agent ID:", agentId);
    try {
      const response = await fetch("/api/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: RegisterCallResponse = await response.json();
      return data;
    } catch (err) {
      console.error("Error registering call:", err);
      throw err;
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('active');
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('active');
    toggleConversation();
  }; 

  return (
    <div className="App">
      <header className="App-header">
        <div className="portrait-wrapper">
          <div
            className={`portrait-container ${isCalling ? 'active' : 'inactive'} ${isAgentSpeaking ? 'agent-speaking' : ''}`}
            onClick={toggleConversation}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src="/Fiona_Round.png"
              alt="AI Agent"
              className="agent-portrait"
            />
          </div>
          <div className={`instructions ${instructionsVisible ? 'visible' : 'hidden'}`}>
            <p><strong>Click</strong> or <strong>Tap</strong></p>
            <p>Fiona's portrait to begin</p>
          </div>
        </div>
      </header>
    </div>
  );
};

export default App;