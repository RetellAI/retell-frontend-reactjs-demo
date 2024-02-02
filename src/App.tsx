import React, { useEffect, useState } from "react";
import "./App.css";
import { AudioEncoding } from "retell-sdk/models/components";
import { RetellClientSdk } from "retell-client-js-sdk";

const apiKey = "Your_Api_Key";
const agentId = "Your_Agent_Id";


const App = () => {
  const [sdk, setSdk] = useState<RetellClientSdk | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  // Initialize the SDK
  useEffect(() => {
   
    const newSdk = new RetellClientSdk(apiKey);
    setSdk(newSdk);

    // Setup event listeners
    newSdk.on("onConversationStarted", () => {
      console.log("Conversation started");
    });

    newSdk.on("onConversationEnded", (error) => {
      console.log("Conversation ended");
      console.log(error);
      setIsCalling(false); // Update button to "Start" when conversation ends
    });

    newSdk.on("onError", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false); // Update button to "Start" in case of error
    });
  }, []);

  const toggleConversation = async () => {
    if (isCalling) {
      sdk?.stopConversation();
    } else {
      sdk?.startConversation({
        agentId,
      }).catch(console.error);
      setIsCalling(true); // Update button to "Stop" when conversation starts
    }
  };

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
