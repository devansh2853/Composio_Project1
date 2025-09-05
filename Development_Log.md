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
   The format for setting up triggers was quite simple because of the examples in the docs and on the dashboard. It wasn't clear how to set the url for the endpoint for the trigger using the SDK. The docs showed how to do it via the dashboard. Tried to pass it as an arguement in the .create() method but didn't work. Ended up just adding the endpoing directly via the dashboard. Used ngrok for setting up the url. Also all the triggers seem to have the same endpoint on the dashboard, there's no way to have different endpoint urls for different triggers.

9. Listening to triggers:
   Pretty straightforward. Had to setup ngrok to generate a url for local running. Every time I ran the server, ngrok generated a different url which I then had to manually go and update at the composio dashboard which was a hassle in case of making small changes because of an error.

Day 5

10. Workflow
    Made a basic server file to handle incoming triggers which would handle the entire proccess of reading the trigger payload, identification of assignments and logging into notion.

11. Database Setup:
    Setup a very basic database consisting of user, user_connections, pending_connections, user_settings tables.
    Created APIs on server.js for Sign up and Login

Day 6

12. Front End:
    Created a very basic front end that has authentication and buttons to initiate connections to gmail, notion and gemini and to create trigger.
    The connection status is updated on the page on every reload and after every new connection made.

Day 7

13. Notion Database creation:
    I wanted to make the project run in a way that it would be able to create the notion database schema automatically so that the user wouldn't have to. For this I tried to use the NOTION_UPDATE_SCHEMA_DATABASE tool. I tried to use this in the fashion listed in the friction logs specifically. The tool would return with a succesfull:true value but would still return the proprties exactly the same as they were before. Maybe there's an issue in my implementation but I used the same format for the parameters that I used in the NOTION_CREATE_DATABASE tool. I ended up having the user create a page and providing the page_id for and then the server would create a database with the correct schema inside that page and would return the url on the screen.

Day 8

14. Trigger issue:
    When testing whether the triggers were working, the trigger was firing 4 times for each mail. The first would be successfully handled and the rest would fail with an error about reading an undfined value. It turned out that I had created more triggers with the same email ID and they were all firing at the same time and were all leading to the same webhook and each payload had different user_id attached. The old version of the database was deleted and so it was trying to read values from the database for a user that did not exist. A simple if statement to match the payload's user id to the users table solved this.

Composio-specific Friction Points:

1. No examples of running any tools of any toolkit. It was difficult to understand the exact syntax for executing the tools.

2. Gemini is not supported as a provider in typescript(javascript in my case). I wanted to use gemini for classification and using it as a provider would make my job a lot easier because I wouldn't have to parse the output generated by gemini and handle tool calls myself. But gemini is only supported as a provider in python. This was a bummer as the other options of non-agentic providers like openAI and anthropic required credits to use their API_KEY.

3. I couldn't find a way to set Trigger's webhook url via the SDK. All the triggers share the same webhook url that can only be set via the composio platform. The user may want to have a different webhook url for different triggers and may want to set them via the SDK itself.

4. NOTION_UPDATE_SCHEMA_DATABASE tool not working as expected:
   I tried to update the properties of a notion database using it's database_id in the following manner:

async function updateNotionSchema(user_id, connectedAccountId, db_id) {
const update = await composio.tools.execute("NOTION_UPDATE_SCHEMA_DATABASE",
{
userId: user_id,
connectedAccountId: connectedAccountId,
arguments: {
database_id: db_id,
properties: [
{ name: "course/subject", schema: { rich_text: {} } }
]
}
});

return update;
}

update.succesfull would return to be true but still the properties were the same as before.
