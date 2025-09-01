import composio from './utils/composio.js';
const my_id = "devansh_student";

async function generate_content(userid, cust_prompt) {
    const response = await composio.tools.execute(
    "GEMINI_GENERATE_CONTENT",
        {
            userId: userid,
            arguments: {
                model: "gemini-1.5-flash",
                max_output_tokens: 500,
                prompt: cust_prompt
            }
        }
    );
    return response;
}

const prompt = "Hey gemini, I'm using composio to connect to your API and am testing whether the generate content tool is working. I want to classify some emails in my project using your service, would you be able to do that? Do not give me any code right now, just tell me if you would be able to achieve this. The mails would include Assignment or task mails, along with some other junk mails. I would want to get only the assignment and task mails with their deadlines.";


const gemini_response = await generate_content(my_id, prompt);

console.log(gemini_response);
