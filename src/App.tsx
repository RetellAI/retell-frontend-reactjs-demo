import React from "react";
import "./App.css";
import {
  AudioWsClient,
  RetellClient,
  convertFloat32ToUint8,
  convertUint8ToFloat32,
} from "retell-sdk";
import {
  AudioEncoding,
  AudioWebsocketProtocol,
} from "retell-sdk/models/components/calldetail";
import { RegisterCallResponse } from "retell-sdk/models/operations/registercall";

const apiKey: string = "YOUR_RETELL_API_KEY";
const agentId: string = "YOUR_RETELL_AGENT_ID";

function App() {
  const retell = new RetellClient({
    apiKey: apiKey,
  });
  var liveClient: AudioWsClient;
  var audioContext: AudioContext;
  var isCalling: boolean = false;
  var stream: MediaStream;
  var captureNode;

  // For playback
  var audioData: Float32Array[] = [];
  var audioDataIndex: number = 0;

  // Setup playback
  const setupAudio = async () => {
    audioContext = new AudioContext({
      sampleRate: 24000,
    });

    // Get mic stream
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 24000,
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
      },
    });
    const source = audioContext.createMediaStreamSource(stream);
    captureNode = source.context.createScriptProcessor(1024, 1, 1);
    captureNode.onaudioprocess = function (audioProcessingEvent) {
      if (isCalling) {
        const pcmFloat32Data =
          audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmData = convertFloat32ToUint8(pcmFloat32Data);
        liveClient.send(pcmData);

        // Playback here
        const outputBuffer = audioProcessingEvent.outputBuffer;
        const outputChannel = outputBuffer.getChannelData(0);
        for (let i = 0; i < outputChannel.length; ++i) {
          if (audioData.length > 0) {
            outputChannel[i] = audioData[0][audioDataIndex++];
            if (audioDataIndex === audioData[0].length) {
              audioData.shift();
              audioDataIndex = 0;
            }
          } else {
            outputChannel[i] = 0;
          }
        }
      }
    };
    source.connect(captureNode);
    captureNode.connect(audioContext.destination);

    console.log("Audio setup complete");
  };

  const startMic = async () => {
    try {
      // Setup computer mic input
      await setupAudio();

      // Register call
      let res: RegisterCallResponse = await retell.registerCall({
        agentId: agentId,
        audioWebsocketProtocol: AudioWebsocketProtocol.Web,
        audioEncoding: AudioEncoding.S16le,
        sampleRate: 24000,
      });
      if (!res || !res.callDetail) {
        console.error("Register call failed");
        return;
      }
      console.log("Registered call: ", res.callDetail);

      //Start websocket with Retell Server
      liveClient = new AudioWsClient(res.callDetail.callId);

      // Handling incoming audio data for playback
      liveClient.on("audio", (audio: Uint8Array) => {
        const float32Data: Float32Array = convertUint8ToFloat32(audio);
        audioData.push(float32Data);
      });

      // Handle errors and close
      liveClient.on("error", (error: string) => {
        console.error("Call error: ", error);
        stopMic();
      });
      liveClient.on("close", (code: number, reason: string) => {
        console.log("Call closed: ", code, reason);
        stopMic();
      });

      isCalling = true;
      audioContext.resume();
    } catch (err) {
      console.error("Error in creating web call: ", err);
    }
  };

  const stopMic = () => {
    isCalling = false;
    liveClient?.close();
    audioContext?.suspend();
    captureNode?.disconnect();
    stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  };

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={startMic}>Start</button>
        <button onClick={stopMic}>Stop</button>
      </header>
    </div>
  );
}

export default App;
