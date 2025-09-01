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
   Tried making connections using the auth config id but was running into a lot of errors because of lack of knowledge of the classes and methods.
   Found and read the documentation of core class composio and connectedAccount. Successfully made gmail connections. If case of a failed connection, there was a connection initated which lead to a ComposioMultipleConnectedAccountsError. Used try and catch to handle that; In case of an already existing account, I tried to get that connection but .get() method used the nanoid and it was unclear how to get it. On console logging the results of .list() there was no userid field in the object logged, but the example in the docs showed how to use the userid query in the list to get the corresponding item or items, which was a bit weird.

4. Using Gmail's tools:
   In the execute tools section of the docs, it showed how to use anthropic or versel to execute the code. Experimented with composio.tools to find the composio.tools.execute() method. Ran the tools using it. Also ran the tools using the composio.provider.execute() method. It is a bit unclear what the difference between these 2 methods is. Got the same response from both methods.

Day 2

5. Connecting to Notion:
   Read the docs for Notion connection
   Made a Notion AuthConfig on composio.
   same code as connecting to google with just the the authconfig updated. Turned out to be quite simple this time.

6. Using Notion's tools:
   This again proved to be quite a challenge without using an LLM. The tools had a detailed description in the docs, but there was no example of how to execute the code with something simple like composio.tools.execute() or composio.provider.execute()
