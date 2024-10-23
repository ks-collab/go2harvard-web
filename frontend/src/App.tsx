import { useState } from "react";
import "./App.css";
import { DemoCreateAccount } from "./components/create-account";
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

const BACKEND_URL = import.meta.env.BASE_URL;

function App() {
  const [formType, setFormType] = useState<"login" | "createAccount">("login");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeChatbot, setActiveChatbot] = useState<Chatbot>(chatbots[0]);

  const onSubmitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${BACKEND_URL}token`, {
      method: "post",
      body: formData,
    });
    const json = await response.json();
    if (json.access_token) {
      setToken(json.access_token);
      setError(null);
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  const onSubmitCreateAccount = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${BACKEND_URL}register`, {
      method: "post",
      body: formData,
    });
    const json = await response.json();
    if (json.access_token) {
      setToken(json.access_token);
      setError(null);
      setFormType("login");
    } else {
      setError("Failed to create account. Please try again.");
    }
  };

  if (token) {
    return (
      <div>
        {chatbots.map((chatbot) => (
          <button key={chatbot.name} onClick={() => setActiveChatbot(chatbot)}>
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
    );
  }

  return (
    <>
      <DemoCreateAccount />
      {formType === "login" && (
        <form onSubmit={onSubmitLogin}>
          <label>
            Email:
            <input type="email" name="username" />
          </label>
          <label>
            Password:
            <input type="password" name="password" />
          </label>
          <button type="submit">Login</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p>
            New to Go2Harvard?{" "}
            <a href="#" onClick={() => setFormType("createAccount")}>
              Join now
            </a>
          </p>
        </form>
      )}
      {formType === "createAccount" && (
        <form onSubmit={onSubmitCreateAccount}>
          <label>
            Email:
            <input type="email" name="username" />
          </label>
          <label>
            Password:
            <input type="password" name="password" />
          </label>
          <button type="submit">Create Account</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p>
            Already have an account?{" "}
            <a href="#" onClick={() => setFormType("login")}>
              Login
            </a>
          </p>
        </form>
      )}

      <p>
        Learn More:
        <a href="https://github.com/ks-collab/go2harvard-web">
          <GitHubLogoIcon className="inline" /> GitHub
        </a>
      </p>
    </>
  );
}

export default App;
