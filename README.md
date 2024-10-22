# Go2Harvard

Go2Harvard is a college admissions AI assistant, powered by [GPT-trainer](https://gpt-trainer.com/).

This application demonstrates how to use some of GPT-trainer's advanced features, such as AI-aware variables and user identity verification.

## Installation

1. Clone the repo:

   ```
   git clone https://github.com/ks-collab/go2harvard-web.git
   ```

2. From `/frontend`:

   - Set chatbot names and URLs in `.env.production`. The variables should be named like `VITE_BOT_1_NAME` and `VITE_BOT_1_URL`. You can set up multiple chatbots, just increment the number.
   - Set `VITE_BASE_URL` to the URL where the app will be hosted.
   - Install Node.js, preferably with [nvm](https://github.com/nvm-sh/nvm).
   - Install dependencies and build for production:
     ```
     npm install
     npm run build
     ```

3. From `/backend`:

   - Install Python, preferably with [pyenv](https://github.com/pyenv/pyenv).
   - Prepare the virtual environment and initialize the database:
     ```
     mkdir data log
     python -m venv .venv
     source .venv/bin/activate
     pip install --upgrade pip
     pip install -r requirements.txt
     python scripts/init_db.py
     ```

## Usage

### Start the Server

1. From `/backend`, run

   ```
   ./launch_app.sh
   ```

2. Access the web application at `localhost:8000`. Create a new user (if you haven't already), and start chatting with your chatbot!

### Connect GPT-trainer chatbot

If you don't have a GPT-trainer chatbot yet, you can [get started for free](https://app.gpt-trainer.com/site/signup).

Set up chatbot:

- Enable User Identity Verification. Enable "Save Data on Success" and "Allow AI to Access Data".

- In "User Data Collection", create a fixed variable `user_uuid`

  - Description: "Unique identifier for each user"
  - Data Type: Text
  - Example: "bb3421d0-f24b-40a2-9d5c-416273c45170"
  - Default Value: "" (blank)
  - Fixed Value: no (setting Fixed = yes makes the data collection webhook use the default value, not the one provided by UIV)

- In "Settings > Webhook", Set up a Data Collection Webhook. Make sure the `user_uuid` variable is included in the data collection webhook.

- note that the webhook only gets triggered after all variables have been collected, and on subsequent updates to them.
- only the variables defined in the chatbot are available to the AI. Even if you pass in other variables in the user identity verification response, and even if you see them in the chat history, the AI cannot access them.
- for syncing of the variables between the chatbot and the app, we can use a fixed variable to store the user's ID (unique to the app) in the chat session. This variable will be included in the data collection webhook, so we can match up the variables collected by the chatbot with the right user in the app's database.
- example values are helpful to make sure the data returned by UIV is loaded into the chat session properly.

## Features

### AI-aware Variables

GPT-trainer chatbots can collect variables from users and refer to them when reasoning and writing responses.

In this application, these variables are synchronized with an external database, allowing for more complex use cases, such as giving users continuity in their chatbot interactions, even if they start a new chat session or switch devices.

Here's how it works:

- Variables are provided to the chatbot in the response to the User Identity Verification webhook, in addition to approving the user authentication request.
- Variables are retrieved from the chatbot via the Data Collection webhook.
- Variables are associated with a user by including a variable to store the user's ID, so that the chatbot sends it along with the collected variables in the Data Collection webhook.
- A single application can connect to multiple chatbots by using unique webhook URLs that identify which chatbot is connecting to the application.

### User Identity Verification

User Identity Verification allows us to require users to login through the application before they can access the chatbot.

See the [User Identity Verification guide](https://guide.gpt-trainer.com/user-identity) for more details.

## Set up for Development

- Create a `.env.development`, following the format in `.env.production`
- To build the frontend using development environment variables, use this instead:

  ```
  npm install
  npx vite build --mode development
  ```

- Your development server must also be accessible to the public internet, in order to receive webhook requests from `app.gpt-trainer.com`.
- A GPT-trainer chatbot can only be configured to send webhooks to 1 server, so you could create a separate chatbot for development.

## Contact

For more information, visit [gpt-trainer.com](https://gpt-trainer.com/) or reach out at hello@gpt-trainer.com.
