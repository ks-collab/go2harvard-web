import { useState } from "react";

import { LoginOrCreateAccount } from "./components/LoginOrCreateAccount";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

// load chatbot config from env vars
type Chatbot = {
  name: string;
  url: string;
};

const chatbots: Chatbot[] = [];
for (let i = 1; import.meta.env[`VITE_BOT_${i}_NAME`]; i++) {
  chatbots.push({
    name: import.meta.env[`VITE_BOT_${i}_NAME`],
    url: import.meta.env[`VITE_BOT_${i}_URL`],
  });
}

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [activeChatbot, setActiveChatbot] = useState<Chatbot>(chatbots[0]);

  return (
    <div className="h-screen flex justify-center items-center">
      {token ? (
        <div className="grow">
          {chatbots.map((chatbot) => (
            <button
              key={chatbot.name}
              onClick={() => setActiveChatbot(chatbot)}
            >
              {chatbot.name}
            </button>
          ))}
          <div style={{ width: "92vw", height: "92vh" }}>
            <iframe
              src={`${activeChatbot.url}?token=${token}`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              allow="clipboard-read; clipboard-write"
            ></iframe>
          </div>
        </div>
      ) : (
        <div className="grow">
          <LoginOrCreateAccount setToken={setToken} />
          <p className="text-sm text-center mt-4">
            Learn More:{" "}
            <a href="https://github.com/ks-collab/go2harvard-web">
              <GitHubLogoIcon className="inline" /> GitHub
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
