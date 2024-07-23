import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { RetellWebClient } from "retell-client-js-sdk";

const agentId = process.env.REACT_APP_RETELL_AGENTID;
const apiKey = process.env.REACT_APP_RETELL_API_KEY;

interface RegisterCallResponse {
  call_id: string;
  access_token: string;
  call_type: string;
  agent_id: string;
  call_status: string;
}

const webClient = new RetellWebClient();

const App = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    webClient.on("conversationStarted", () => {
      console.log("Conversation started");
      setIsCalling(true);
    });

    webClient.on("audio", (audio: Uint8Array) => {
      console.log("Received audio chunk, length:", audio.length);
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Conversation ended. Code:", code, "Reason:", reason);
      setIsCalling(false);
      setIsAgentSpeaking(false);
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false);
      setIsAgentSpeaking(false);
    });

    webClient.on("update", (update) => {
      console.log("Received update:", update);
      if (update.type === "transcript") {
        const isAgent = update.transcript.role === "agent";
        console.log("Is agent speaking:", isAgent);
        setIsAgentSpeaking(isAgent);
      }
    });
  }, []);

  useEffect(() => {
    console.log("isAgentSpeaking changed:", isAgentSpeaking);
    if (containerRef.current) {
      if (isAgentSpeaking) {
        containerRef.current.style.boxShadow = '0 0 0 10px rgba(255, 0, 0, 0.7)'; // Red for agent
      } else {
        containerRef.current.style.boxShadow = '0 0 0 10px rgba(0, 255, 0, 0.7)'; // Green for user
      }
    }
  }, [isAgentSpeaking]);

  const toggleConversation = async () => {
    if (isCalling) {
      console.log("Stopping conversation");
      webClient.stopConversation();
    } else {
      console.log("Starting conversation");
      try {
        const registerCallResponse = await registerCall(agentId);
        console.log("Register call response:", registerCallResponse);
        if (registerCallResponse.call_id) {
          webClient
            .startConversation({
              callId: registerCallResponse.call_id,
              accessToken: registerCallResponse.access_token,
              enableUpdate: true,
            })
            .catch(console.error);
        }
      } catch (error) {
        console.error("Error registering call:", error);
      }
    }
  };

  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    console.log("Registering call for agent:", agentId);
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        agent_id: agentId
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${await response.text()}`);
    }

    const data: RegisterCallResponse = await response.json();
    console.log("Register call API response:", data);
    return data;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div 
          ref={containerRef} 
          className={`portrait-container ${isCalling ? 'active' : ''} ${isAgentSpeaking ? 'agent-speaking' : 'user-speaking'}`}
          onClick={toggleConversation}
        >
          <img 
            src={`${process.env.PUBLIC_URL}/Fiona_Round.png`}
            alt="Agent Portrait" 
            className="agent-portrait"
          />
        </div>
        <p>Call Status: {isCalling ? 'Active' : 'Inactive'}</p>
        <p>Speaker: {isAgentSpeaking ? 'Agent' : 'User'}</p>
      </header>
    </div>
  );
};

export default App;
