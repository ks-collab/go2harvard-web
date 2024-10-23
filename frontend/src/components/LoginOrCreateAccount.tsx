import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, useMemo } from "react";

const BACKEND_URL = import.meta.env.BASE_URL;

export function LoginOrCreateAccount({
  setToken,
}: {
  setToken: (token: string | null) => void;
}) {
  const [formType, setFormType] = useState<"login" | "createAccount">("login");
  const [error, setError] = useState<string | null>(null);

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
    const default_failed_to_create_account_message =
      "Failed to create account. Please try again.";

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${BACKEND_URL}register`, {
      method: "post",
      body: formData,
    });

    let json;
    try {
      json = await response.json();
    } catch {}

    if (response.status == 200) {
      if (json.access_token) {
        setError(null);
        setToken(json.access_token);
      } else {
        setError(default_failed_to_create_account_message);
      }
    } else {
      setError(default_failed_to_create_account_message);
      if (json.detail) {
        setError(`Failed to create account. ${json.detail}.`);
      }
    }
  };

  const toggleFormType = async () => {
    setError(null);
    if (formType === "login") {
      setFormType("createAccount");
    } else {
      setFormType("login");
    }
  };

  const formText = useMemo(() => {
    if (formType === "login") {
      return {
        title: "Log In",
        buttonText: "Log In",
        toggleText: "New to Go2Harvard?",
        toggleLink: "Join now",
        onSubmit: onSubmitLogin,
      };
    } else {
      return {
        title: "Create an account",
        buttonText: "Create Account",
        toggleText: "Already have an account?",
        toggleLink: "Log In",
        onSubmit: onSubmitCreateAccount,
      };
    }
  }, [formType]);

  return (
    <div className="mx-16 sm:mx-auto sm:w-full sm:max-w-md">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
        Go2Harvard
      </h1>
      <p className="leading-7 text-center text-sm">
        Powered by <a href="https://gpt-trainer.com">GPT-trainer</a>
      </p>

      <form className="my-4" onSubmit={formText.onSubmit}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{formText.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="username" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              {formText.buttonText}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <p className="text-sm text-center">
        {formText.toggleText}{" "}
        <a href="#" onClick={() => toggleFormType()}>
          {formText.toggleLink}
        </a>
      </p>
    </div>
  );
}
