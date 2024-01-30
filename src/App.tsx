import React from "react";
import "./App.css";
// import {
//   RetellClient,
//   convertFloat32ToUint8,
//   convertUint8ToFloat32,
// } from "retell-sdk";
// import { CallType, SortOrder } from "retell-sdk/models/operations";
import {
  LiveClient,
  convertFloat32ToUint8,
  convertUint8ToFloat32,
} from "./liveClient.ts";
import axios from "axios";
import "./keys.ts";
import {
  demoAgentId,
  demoApiKey,
  demoSampleRate,
  httpBaseEndpoint,
  webSocketBaseEndpoint,
} from "./keys.ts";

function App() {
  // const retell = new RetellClient({
  //   apiKey: demoApiKey,
  // });
  var liveClient;
  var audioContext;
  var captureNode;
  var isCalling = false;
  var stream;

  // For playback
  var audioData: Float32Array[] = [];
  var audioDataIndex = 0;

  // Setup playback
  const setupAudio = async () => {
    audioContext = new AudioContext({
      sampleRate: demoSampleRate,
    });

    // Get mic stream
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: demoSampleRate,
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

    console.log("audio setup complete");
  };

  const startMic = async () => {
    // Handle server audio
    try {
      await setupAudio();
      let res = await registerCall({
        agent_id: demoAgentId,
        audio_websocket_protocol: "web",
        audio_encoding: "s16le",
        sample_rate: demoSampleRate,
      });
      console.log(res);
      liveClient = new LiveClient(res.call_id);
    } catch (err) {
      console.error("Error in creating web call:", err);
    }

    liveClient.on("audio", (audio: Uint8Array) => {
      const float32Data: Float32Array = convertUint8ToFloat32(audio);
      audioData.push(float32Data);
    });
    liveClient.on("error", (error) => {
      console.log("error", error);
      stopMic();
    });
    liveClient.on("close", (code: number, reason: string) => {
      console.log("closed", code, reason);
      stopMic();
    });

    isCalling = true;
    audioContext.resume();
  };

  const stopMic = () => {
    isCalling = false;
    liveClient?.close();
    audioContext?.suspend();
    captureNode?.disconnect();
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  // const createPhoneCall = async () => {
  //   const ongoingCall = await retell.createPhoneCall({
  //     phoneNumber: {
  //       from: "+13124719158",
  //       to: "+13123156250",
  //     },
  //   });
  //   console.log("phone call: ", ongoingCall);
  // };

  // const getCall = async () => {
  //   const call = await retell.getCall("95a6693f7b284190efce6fbdb227999e");
  //   console.log("Call history: ", call);
  // };

  // const listCalls = async () => {
  //   const filterCriteria = {
  //     afterEndTimestamp: 1703302428800,
  //     afterStartTimestamp: 1703302407300,
  //     agentId: ["oBeDLoLOeuAbiuaMFXRtDOLriTJ5tSxD"],
  //     beforeEndTimestamp: 1703302428899,
  //     beforeStartTimestamp: 1703302407399,
  //     callType: [CallType.InboundPhoneCall],
  //   };
  //   const limit = 666195;
  //   const sortOrder = SortOrder.Descending;
  //   const calls = await retell.listCalls(filterCriteria, limit, sortOrder);
  //   console.log("list calls ", calls);
  // };
  // const createAgent = async () => {
  //   const newAgent = await retell.createAgent({
  //     agentName: "Jarvis",
  //     beginMessage: "Hello there, how can I help you?", // Optional
  //     enableBeginMessage: true, // Optional, default false
  //     enableEndCall: true, // Optional, default true
  //     enableEndMessage: false, // Optional, default false
  //     endMessage: "Hope you have a good day, goodbye.", // Optional
  //     prompt: `You are a marketing assistant. You help come up with
  //     creative content ideas and content like marketing emails,
  //     blog posts, tweets, ad copy and product descriptions.
  //     You respond concisely, with filler words in it.`,
  //     voiceId: "11labs-Jason", // Find voice ids in documentation
  //   });
  //   console.log("Create an agent: ", newAgent);
  // };

  // const getAgent = async () => {
  //   const agentId = "16b980523634a6dc504898cda492e939";
  //   const agent = await retell.getAgent(agentId);
  //   console.log("get agent: ", agent);
  // };

  // const listAgents = async () => {
  //   const agents = await retell.listAgents();
  //   console.log("List agents: ", agents);
  // };

  // const updateAgent = async () => {
  //   const agentParams = {
  //     agentName: "Jarvis",
  //     beginMessage: "Hello there, how can I help you.",
  //     enableBeginMessage: true,
  //     enableEndCall: true,
  //     enableEndMessage: false,
  //     endMessage: "Hope you have a good day, goodbye.",
  //     prompt:
  //       "You are a marketing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, ad copy and product descriptions. You respond concisely, with filler words in it.",
  //     voiceId: "11labs-Jason",
  //   };
  //   const agentId = "ba9f714575508279c6c6ba88990836d5";
  //   const agent = await retell.updateAgent(agentParams, agentId);
  //   console.log("update agent", agent);
  // };

  // const deleteAgent = async () => {
  //   const agentId = "ba9f714575508279c6c6ba88990836d5";
  //   const res = await retell.deleteAgent(agentId);
  //   console.log("delete agent", res);
  // };

  // const createPhoneNumber = async () => {
  //   const newPhoneNumber = await retell.createPhoneNumber({
  //     agentId: "ba9f714575508279c6c6ba88990836d5",
  //     areaCode: 415,
  //   });
  //   console.log("New phone number: ", newPhoneNumber);
  // };

  // const getPhoneNumber = async () => {
  //   const phoneNumber = "+13124719158"; // Phone number you created previously
  //   const phoneNumberObject = await retell.getPhoneNumber(phoneNumber);
  //   console.log("get phone numbers", phoneNumberObject);
  // };

  // const listPhoneNumbers = async () => {
  //   const res = await retell.listPhoneNumbers();
  //   console.log("list phone numbers", res);
  // };

  // const updatePhoneAgent = async () => {
  //   const requestBody = {
  //     agentId: "ba9f714575508279c6c6ba88990836d5",
  //   };
  //   const phoneNumber = "+13124719158";
  //   const res = await retell.updatePhoneAgent(requestBody, phoneNumber);
  //   console.log("update phone agent", res);
  // };

  // const deletePhoneNumber = async () => {
  //   const phoneNumber = "+13124719158";
  //   const res = await retell.deletePhoneNumber(phoneNumber);
  //   console.log("delete phone number", res);
  // };

  const registerCall = async (options: any) => {
    try {
      let response = await axios({
        url: httpBaseEndpoint + "/register-call",
        method: "POST",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  const createAgent2 = async (options: any) => {
    try {
      let response = await axios({
        url: httpBaseEndpoint + "/create-agent",
        method: "POST",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  const getAgent2 = async (options: any) => {
    try {
      let response = await axios({
        url: httpBaseEndpoint + "/get-agent/" + options.agent_id,
        method: "GET",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  const listAgents2 = async () => {
    try {
      let response = await axios({
        url: httpBaseEndpoint + "/list-agents",
        method: "GET",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  const updateAgent2 = async (options: any) => {
    try {
      let response = await axios({
        url: httpBaseEndpoint + "/update-agent/" + options.agent_id,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  const deleteAgent2 = async (options: any) => {
    try {
      let response = await axios({
        url: httpBaseEndpoint + "/delete-agent/" + options.agent_id,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  const createPhoneNumber2 = async (options: any) => {
    try {
      let response = await axios({
        url: httpBaseEndpoint + "/create-phone-number",
        method: "POST",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  const createPhoneCall2 = async (options: any) => {
    try {
      let response = await axios({
        url: httpBaseEndpoint + "/create-phone-call",
        method: "POST",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  const RunRetellApis = async () => {
    // if (!retell) return;
    // let res = await registerCall({
    //   agent_id: "fd8b5df78d1cdab31194b2b6c349946d",
    //   audio_websocket_protocol: "web",
    //   audio_encoding: "s16le",
    //   sample_rate: 12335,
    // });
    // console.log(res);
    // let res = await createAgent2({
    //   llm_websocket_url: "123",
    //   voice_id: "openai-Nova",
    //   agent_name: "123",
    // });
    // console.log(res);
    // let res = await getAgent2({
    //   agent_id: "d9f66007232809aca1c3a6cdb84c3f47",
    // });
    // console.log(res);
    // let res = await updateAgent2({
    //   agent_id: "d9f66007232809aca1c3a6cdb84c3f47",
    //   llm_websocket_url: "345",
    // });
    // console.log(res);
    // let res = await createPhoneNumber2({
    //   agent_id: demoAgentId,
    //   area_code: "213",
    // });
    // console.log(res);
    let res = await createPhoneCall2({
      phone_number: {
        from: "+12133403027",
        to: "+13123156250",
      },
    });
    console.log(res);
    // createPhoneCall();
    // getCall();
    // listCalls();
    // createAgent();
    // getAgent();
    // listAgents();
    // updateAgent();
    // deleteAgent();
    // createPhoneNumber();
    // getPhoneNumber();
    // listPhoneNumbers();
    // updatePhoneAgent();
    // deletePhoneNumber();
  };

  RunRetellApis();

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
