import { EventEmitter } from "events";
import axios from "axios";

interface PromptParam {
  name: string;
  value: string;
}

export class LiveClient extends EventEmitter {
  public ws: WebSocket;

  constructor(
    apiKey: string,
    agentId: string,
    sampleRate: number,
    agentPromptParams: PromptParam[],
    baseEndpoint: string
  ) {
    super();

    let endpoint =
      baseEndpoint +
      "/create-web-call?api_key=" +
      apiKey +
      "&agent_id=" +
      agentId +
      "&sample_rate=" +
      sampleRate;
    for (let param of agentPromptParams) {
      endpoint += "&agent_prompt_params=" + JSON.stringify(param);
    }
    this.ws = new WebSocket(endpoint);
    this.ws.binaryType = "arraybuffer";
  }

  waitForReady() {
    return new Promise<void>((resolve, reject) => {
      const onError = (error) => {
        reject(error); // Reject on error
      };
      this.ws.onerror = onError;

      const onClose = (event) => {
        reject("websocket closed before ready.");
      };
      this.ws.onclose = onClose;

      const onMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === "ready") {
            // Remove all registered listeners for cleaner future processing.
            this.ws.removeEventListener("error", onError);
            this.ws.removeEventListener("close", onClose);
            this.ws.removeEventListener("message", onMessage);
            // Emit audio
            this.ws.onmessage = (event) => {
              let audio = event.data;
              this.emit("audio", new Uint8Array(audio));
            };
            this.ws.onclose = (event) => {
              this.emit("close", event);
            };
            resolve(); // Resolve when the ready message is received
          }
        } catch (error) {
          // Handle JSON parsing error
          reject("malformed ready event.");
        }
      };
      this.ws.onmessage = onMessage;
    });
  }

  send(audio: Uint8Array) {
    if (this.ws.readyState === 1) this.ws.send(audio);
  }

  close() {
    this.ws.close();
  }
}

export function convertPCM16ToFloat32(array: Uint8Array): Float32Array {
  const targetArray = new Float32Array(array.byteLength / 2);

  // A DataView is used to read our 16-bit little-endian samples out of the Uint8Array buffer
  const sourceDataView = new DataView(array.buffer);

  // Loop through, get values, and divide by 32,768
  for (let i = 0; i < targetArray.length; i++) {
    targetArray[i] = sourceDataView.getInt16(i * 2, true) / Math.pow(2, 16 - 1);
  }
  return targetArray;
}

export function convertFloat32ToPCM16(array: Float32Array): Uint8Array {
  const buffer = new ArrayBuffer(array.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < array.length; i++) {
    const value = array[i] * 32768;
    view.setInt16(i * 2, value, true); // true for little-endian
  }

  return new Uint8Array(buffer);
}

export default class Retell {
  public apiKey: string;
  public baseEndpoint: string;

  constructor(apiKey: string, baseEndpoint?: string) {
    this.baseEndpoint = baseEndpoint ?? "https://api.re-tell.ai";
    this.apiKey = apiKey;
  }

  createPhoneCall = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/create-phone-call",
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  async createWebCall(
    agentId: string,
    sampleRate = 16000,
    agentPromptParams = [],
    websocketEndpoint: string = "wss://api.re-tell.ai"
  ): Promise<LiveClient> {
    const liveClient = new LiveClient(
      this.apiKey,
      agentId,
      sampleRate,
      agentPromptParams,
      websocketEndpoint
    );
    await liveClient.waitForReady();
    return liveClient;
  }

  getCall = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/get-call/" + options.call_id,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  listCalls = async () => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/list-calls",
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  createAgent = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/create-agent",
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  getAgent = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/get-agent/" + options.agent_id,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  listAgents = async () => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/list-agents",
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  updateAgent = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/update-agent/" + options.agent_id,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  deleteAgent = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/delete-agent/" + options.agent_id,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  createPhoneNumber = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/create-phone-number",
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  getPhoneNumber = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/get-phone-number/" + options.phone_number,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  listPhoneNumber = async () => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/list-phone-numbers",
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  updatePhone = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/update-phone-agent/" + options.phone_number,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };

  deletePhoneNumber = async (options: any) => {
    try {
      let response = await axios({
        url: this.baseEndpoint + "/delete-phone-number/" + options.phone_number,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-type": "application/json",
        },
        data: options,
      });
      return response.data;
    } catch (err) {
      return err;
    }
  };
}
