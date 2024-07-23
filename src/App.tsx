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
  const [isCalling, setIsCalling] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    webClient.on("conversationStarted", () => {
      console.log("conversationStarted");
      setIsCalling(true);
    });

    webClient.on("audio", (audio: Uint8Array) => {
      if (audioContextRef.current && analyserRef.current && audio.length > 0) {
        try {
          const audioBuffer = audioContextRef.current.createBuffer(1, audio.length, audioContextRef.current.sampleRate);
          audioBuffer.getChannelData(0).set(audio);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(analyserRef.current);
          source.start();
          if (isAgentSpeaking) {
            updateHaloEffect();
          }
        } catch (error) {
          console.error("Error processing audio:", error);
        }
      }
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Closed with code:", code, ", reason:", reason);
      setIsCalling(false);
      setIsAgentSpeaking(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false);
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

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const updateHaloEffect = () => {
    if (analyserRef.current && containerRef.current && isAgentSpeaking) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedAverage = average / 255;

      containerRef.current.style.boxShadow = `0 0 0 ${normalizedAverage * 20}px rgba(255, 255, 255, 0.7)`;

      animationFrameRef.current = requestAnimationFrame(updateHaloEffect);
    } else if (containerRef.current && !isAgentSpeaking) {
      containerRef.current.style.boxShadow = '0 0 0 10px rgba(0, 255, 0, 0.7)';
    }
  };

  useEffect(() => {
    if (isAgentSpeaking) {
      updateHaloEffect();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current) {
        containerRef.current.style.boxShadow = '0 0 0 10px rgba(0, 255, 0, 0.7)';
      }
    }
  }, [isAgentSpeaking]);

  const toggleConversation = async () => {
    if (isCalling) {
      webClient.stopConversation();
    } else {
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
          className={`portrait-container ${isCalling ? 'active' : ''} ${isAgentSpeaking ? 'agent-speaking' : 'user-speaking'}`}
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
