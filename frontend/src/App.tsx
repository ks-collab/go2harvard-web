import { useState } from "react";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginOrCreateAccount } from "@/components/LoginOrCreateAccount";

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
  const [activeChatbotIndex, setActiveChatbotIndex] = useState<string>("0");
  const activeChatbot = chatbots[Number(activeChatbotIndex)];

  return (
    <>
      {token ? (
        <div className="h-screen flex flex-col justify-center items-start p-2 gap-2 max-w-5xl mx-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {activeChatbot.name} <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup
                value={activeChatbotIndex}
                onValueChange={setActiveChatbotIndex}
              >
                {chatbots.map((chatbot, index) => (
                  <DropdownMenuRadioItem value={String(index)}>
                    {chatbot.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="grow self-stretch">
            <iframe
              src={`${activeChatbot.url}?token=${token}`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              allow="clipboard-read; clipboard-write"
            ></iframe>
          </div>
          <p className="leading-6 self-center text-sm text-gray-500">
            Powered by{" "}
            <a href="https://gpt-trainer.com" target="_blank">
              GPT-trainer
            </a>
            . Learn more{" "}
            <a
              href="https://github.com/ks-collab/go2harvard-web"
              target="_blank"
            >
              about this project
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="h-screen flex flex-col justify-center items-stretch">
          <div>
            <LoginOrCreateAccount setToken={setToken} />
            <p className="leading-6 text-center text-sm text-gray-500">
              Powered by{" "}
              <a href="https://gpt-trainer.com" target="_blank">
                GPT-trainer
              </a>
              . Learn more{" "}
              <a
                href="https://github.com/ks-collab/go2harvard-web"
                target="_blank"
              >
                about this project
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
