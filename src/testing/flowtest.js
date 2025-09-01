import composio from './utils/composio.js';
import { convert } from 'html-to-text';

const user_id = "college_id";

const fetchMails = await composio.tools.execute(
    "GMAIL_FETCH_EMAILS",
    {
        userId: user_id,
        arguments: {
            max_results: 5,
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

const prompt1 = `Analyze the following JSON string containing email objects. Identify all emails that are assigning a new assignment with a specific deadline.

For each qualifying email, extract the following information and return it as a JSON array of objects.

Each object in the array must have these four keys:
- **assignment_name**: The name of the assignment (e.g., "Assignment-7", "Assignment 09").
- **course_name**: The subject or course the assignment belongs to (e.g., "Privacy and Security in Online Social Media", "Cloud Computing").
- **due_date**: The full, exact due date for the assignment (e.g., "2025-05-02" YYYY-MM-DD format).
- **message_id**: The unique ID of the email message.

If no emails contain an assigned assignment with a deadline, return a JSON array that is empty: '[]'.

**Do not include any other text, explanations, or formatting outside of the JSON array.**

Here is the email data as a JSON string: ${JSON.stringify(mail_data)}`;
const response = await composio.tools.execute(
    "GEMINI_GENERATE_CONTENT",
        {
            userId: user_id,
            arguments: {
                model: "gemini-1.5-flash",
                max_output_tokens: 500,
                prompt: prompt1
            }
        }
);
    
// console.log(response.data.text);


let cleaned = response.data.text.replace(/```json\n?/, '').replace(/```\n?$/, '').replace(/\\n/g, '\n').replace(/\\'/g, "'");

const resp_object_list = JSON.parse(cleaned);
let props = [];
for (let i = 0; i < resp_object_list.length; i++) {

    const name_obj = {
        name: "Name",
        type: "title",
        value: resp_object_list[i].assignment_name
    };
    const due_date_obj = {
        name: "Due Date",
        type: "date",
        value: resp_object_list[i].due_date
    };
    const sub_obj = {
        name: "course/subject",
        type: "rich_text",
        value: resp_object_list[i].course_name
    };
    let prop_i = [];
    prop_i.push(name_obj);
    prop_i.push(due_date_obj);
    prop_i.push(sub_obj);
    props.push(prop_i);
}
// console.log(props);

for (let i = 0; i < props.length; i++) {
    const exec = await composio.tools.execute(
        "NOTION_INSERT_ROW_DATABASE",
        {
            userId: "devansh_student",
            arguments: {
                database_id: "a253316f3f1349fc9b9224e2a0ee7f1d",
                properties: props[i]
            }
        }
    );
    console.log(exec);
}


