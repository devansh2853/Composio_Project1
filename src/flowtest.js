import composio from './utils/composio.js';
import { convert } from 'html-to-text';

const user_id = "college_id";

const fetchMails = await composio.tools.execute(
    "GMAIL_FETCH_EMAILS",
    {
        userId: user_id,
        arguments: {
            max_results: 10,
            query: "assignment live"
        }
    }
);

// console.log(fetchMails.data);
const mailList = fetchMails.data.messages;

const mail_data = mailList.map((mail) => {
    return {
        subject: mail.subject,
        messageID: mail.messageID,
        sender: mail.sender,
        content: convert(mail.messageText)
    }
});

let responses = [];
for (let i = 0; i < mail_data.length; i++)
{
    const inputforgemini = JSON.stringify(mail_data[i], null, 2);
    const response = await composio.tools.execute(
    "GEMINI_GENERATE_CONTENT",
        {
            userId: 'devansh_student',
            arguments: {
                model: "gemini-1.5-flash",
                max_output_tokens: 500,
                prompt: `This is a mail in my mailbox, I need you to find out if this mail is alloting assignments to me. I need a format with these parameters: Assignment name, Assignment Subject/Course, Due Date, mail link(generate using the messageID). If not then respond with just "NO" Here are the mails: ${inputforgemini}`
            }
        }
    );
    if (response.data.text != "NO\n") {
        responses.push(response.data.text);
    }
}

console.log(responses);

// console.log(mail_data);