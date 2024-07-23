import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { RetellWebClient } from "retell-client-js-sdk";

const agentId = process.env.REACT_APP_RETELL_AGENTID;

interface RegisterCallResponse {
  callId?: string;
  sampleRate: number;
}

const webClient = new RetellWebClient();

const App = () => {
  const [callStatus, setCallStatus] = useState<'not-started' | 'active' | 'inactive'>('not-started');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    webClient.on("conversationStarted", () => {
      console.log("conversationStarted");
      setCallStatus('active');
      setIsAgentSpeaking(true);
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Closed with code:", code, ", reason:", reason);
      setCallStatus('inactive');
      setIsAgentSpeaking(false);
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setCallStatus('inactive');
      setIsAgentSpeaking(false);
    });

    webClient.on("update", (update) => {
      console.log("update", update);
      if (update.turntaking === "user_turn") {
        setIsAgentSpeaking(false);
      } else if (update.turntaking === "agent_turn") {
        setIsAgentSpeaking(true);
      }
    });
  }, []);

  const toggleConversation = async () => {
    if (callStatus === 'active') {
      webClient.stopConversation();
    } else {
      setCallStatus('active');
      setIsAgentSpeaking(true);
      const registerCallResponse = await registerCall(agentId);
      if (registerCallResponse.callId) {
        webClient
          .startConversation({
            callId: registerCallResponse.callId,
            sampleRate: registerCallResponse.sampleRate,
            enableUpdate: true,
          })
          .catch(console.error);
      }
    }
  };
  
  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    console.log("Registering call for agent:", agentId);
    try {
      const response = await fetch("/api/register-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: RegisterCallResponse = await response.json();
      console.log("Call registered successfully:", data);
      return data;
    } catch (err) {
      console.error("Error registering call:", err);
      throw new Error(String(err));
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div 
          ref={containerRef} 
          className={`portrait-container 
            ${callStatus === 'active' ? 'active' : ''} 
            ${callStatus === 'inactive' ? 'inactive' : ''} 
            ${isAgentSpeaking ? 'agent-speaking' : ''}`}
          onClick={toggleConversation}
        >
          <img 
            src={`${process.env.PUBLIC_URL}/Fiona_Round.png`}
            alt="Agent Portrait" 
            className="agent-portrait"
          />
        </div>
      </header>
    </div>
  );
};

export default App;
