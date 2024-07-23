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
  const [isListening, setIsListening] = useState(false);
  const portraitRef = useRef<HTMLImageElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    webClient.on("conversationStarted", () => {
      console.log("conversationStarted");
      setIsCalling(true);
    });

    webClient.on("audio", (audio: Uint8Array) => {
      if (audioContextRef.current && analyserRef.current) {
        const audioBuffer = audioContextRef.current.createBuffer(1, audio.length, audioContextRef.current.sampleRate);
        audioBuffer.getChannelData(0).set(audio);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyserRef.current);
        source.start();
        updateHaloEffect();
      }
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Closed with code:", code, ", reason:", reason);
      setIsCalling(false);
      setIsListening(false);
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false);
      setIsListening(false);
    });

    webClient.on("update", (update) => {
      console.log("update", update);
      setIsListening(update.type === "interim" || update.type === "final");
    });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateHaloEffect = () => {
    if (analyserRef.current && portraitRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedAverage = average / 255;

      portraitRef.current.style.boxShadow = `0 0 0 ${normalizedAverage * 20}px rgba(255, 255, 255, 0.7)`;

      requestAnimationFrame(updateHaloEffect);
    }
  };

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
    // ... (keep existing registerCall function)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="portrait-container">
          <img 
            ref={portraitRef}
            src="/public/Fiona_round.png" 
            alt="Fiona Portrait" 
            className={`agent-portrait ${isCalling ? 'active' : ''} ${isListening ? 'listening' : ''}`}
            onClick={toggleConversation}
          />
        </div>
      </header>
    </div>
  );
};

export default App;
