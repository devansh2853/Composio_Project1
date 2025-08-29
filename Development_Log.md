Day 1

1. Setup
   Initialized git repo, created readme
   Ran npm init and downloaded dotenv for handling API keys
   Set type to module instead of commonJS in package.json
   Created an account on composio and generated API key
   Pasted it to a .env file
   Created and configured .gitignore file
   Pushed to gihub

2. Using Composio Docs to further setup:
   Saw the setup commands in either python or TypeScript.
   Wasn't sure what TypeScript was, and I didn't know whether the examples applied to my JS project. Quick google search cleaered that up.
   Set up the SDK in ultils/composio.js
   Created a test.js file for testing the connection
   composio.authConfigs.list() was working which meant the connection was successful.

3. Connecting to Gmail
   Read the docs for Gmail connection
   Made a Gmail AuthConfig on composio.
   Tried configuring it with only https://www.googleapis.com/auth/gmail.read only but that lead to
