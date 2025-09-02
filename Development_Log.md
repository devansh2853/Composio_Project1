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
   This again proved to be quite a challenge without using an LLM. The tools had a detailed description in the docs, but there was no example of how to execute the code with something simple like composio.tools.execute() or composio.provider.execute().

Day 3

6. Setting Up Gemini:
   I wanted to use an LLM for classification of the mails. It would be much easier if I could use an LLM provider for this as then the tool calls would be very easy. But Anthropic, OpenAI both require credits to use their API key, so I decided to go with Gemini. Composio doesn't support Gemini as a provider in TypeScript(javascript in my case). Because of this I had to resolve to using Gemini as a tool inside the project instead of the provider. This would mean I would have to handle parsing the response of Gemini myself. Connecting to Gemini was quite easy after generating the Auth Config on the dashboard. Executing the generate content tool was also quite easy.

7. Classification:
   Used gemini itself to generate a prompt that would determine if the mail contained an assignment allotment and return a JSON object consiting of appropriate key-value pairs.
   Had a bit of issue in parsing the response object returned by gemini. Ultimately was able to do it by fine tuning the prompt and replacing the additional tokens being added by gemini.

Day 4

8. Setting up triggers:
   The format for setting up triggers was quite simple because of the examples in the docs and on the dashboard. It wasn't clear how to set the url for the endpoint for the trigger using the SDK. The docs showed how to do it via the dashboard. Tried to pass it as an arguement in the .create() method but didn't work. Ended up just adding the endpoing directly via the dashboard. Used ngrok for setting up the url.

9. Listening to triggeres:

10. Workflow

11. Database Setup:
