import composio from './utils/composio.js';
import { convert } from 'html-to-text';
import db from './db.js';

async function geminiClassification(user_id, cust_prompt) {
    try {
        // Check if user has a Gemini connection
        const geminiConnection = db.prepare('SELECT connection_id FROM user_connections WHERE user_id = ? AND provider = ?').get(user_id, 'gemini');
        if (!geminiConnection) {
            return {
                successful: false,
                error: 'Gemini connection not found. Please connect Gemini first.'
            };
        }

        // Use Composio Gemini tool with user's connection
        const response = await composio.tools.execute(
            "GEMINI_GENERATE_CONTENT",
            {
                connectedAccountId: geminiConnection.connection_id,
                userId: user_id,
                arguments: {
                    model: "gemini-1.5-flash",
                    max_output_tokens: 500,
                    prompt: cust_prompt
                }
            }
        );
        return {
            successful: true,
            response: response
        };
    }
    catch (err) {
        return {
            successful: false,
            error: err.message
        };
    }
}

function parseGeminiResponse(response, messageID) {
    let cleaned_response = response.data.text.replace(/```json\n?/, '').replace(/```\n?$/, '').replace(/\\n/g, '\n').replace(/\\'/g, "'");
    try {
        const resp_object = JSON.parse(cleaned_response);
        if (!resp_object.assignment_name || !resp_object.course_name || !resp_object.due_date) {
            return { successful: true, no_assignment: true };
        }
        let prop = [];
        const name_obj = {
            name: "Name",
            type: "title",
            value: resp_object.assignment_name
        };
        const due_date_obj = {
            name: "Due Date",
            type: "date",
            value: resp_object.due_date
        };
        const sub_obj = {
            name: "course/subject",
            type: "rich_text",
            value: resp_object.course_name
        };
        const mail_link = {
            name: "Email Link",
            type: "url",
            value: `https://mail.google.com/mail/u/0/#inbox/${messageID}`
        };
        prop.push(name_obj);
        prop.push(due_date_obj);
        prop.push(sub_obj);
        prop.push(mail_link);
        return {
            successful: true,
            prop: prop,
            no_assignment: false
        };
    }
    catch (err) {
        return {
            successful: false,
            error: err.message,
            no_assignment: false
        };
    }
    
}

async function logToNotion(prop, user_id, db_id) {
    try {
        // Check if user has a Notion connection
        const notionConnection = db.prepare('SELECT connection_id FROM user_connections WHERE user_id = ? AND provider = ?').get(user_id, 'notion');
        if (!notionConnection) {
            return {
                successful: false,
                error: 'Notion connection not found. Please connect Notion first.'
            };
        }
        const exec = await composio.tools.execute(
        "NOTION_INSERT_ROW_DATABASE",
            {
            connectedAccountId: notionConnection.connection_id,
            userId: user_id,
            arguments: {
                database_id: db_id,
                properties: prop
            }
        }
        );
        return {
            successful: true,
            exec: exec
        };
    }
    catch (err) {
        return {
            successful: false,
            error: err.message
        };
    }
}

async function handleMailTrigger(mail) {
    const mailObject = {
        subject: mail.subject,
        messageID: mail.message_id,
        sender: mail.sender,
        content: convert(mail.message_text)
    };
    // Expect user_id to be present in trigger config or extras
    const user_id = mail?.user_id || mail?.extras?.user_id || "";
    if (!user_id) return { successful: false, error: 'user_id missing in trigger payload' };

    // Load per-user Notion database id
    const settings = db.prepare('SELECT notion_database_id FROM user_settings WHERE user_id = ?').get(user_id);
    if (settings.notion_database_id === null) return { successful: false, error: 'Notion database_id not set for user' };

    const cust_prompt = `Analyze the following JSON string containing an email object. Identify whether the emails is assigning a new assignment with a specific deadline.

                    For a qualifying email, extract the following information and return it as a JSON objects.

                    The object must have these 3 keys:
                    - **assignment_name**: The name of the assignment (e.g., "Assignment-7", "Assignment 09").
                    - **course_name**: The subject or course the assignment belongs to (e.g., "Privacy and Security in Online Social Media", "Cloud Computing").
                    - **due_date**: The full, exact due date for the assignment (e.g., "2025-05-02" YYYY-MM-DD format) (if year is not mentioned assume 2025).

                    If the email doesn't contain an assigned assignment with a deadline, return a JSON object that is empty: '{}'.

                    **Do not include any other text, explanations, or formatting outside of the JSON array.**

                    Here is the email data as a JSON string: ${JSON.stringify(mailObject)}`;
    

    const gemini_response = await geminiClassification(user_id, cust_prompt);
    if (!gemini_response.successful) return gemini_response;
    const parse_output = parseGeminiResponse(gemini_response.response, mailObject.messageID);
    if (!parse_output.successful) return parse_output;
    if (parse_output.successful && parse_output.no_assignment === true) return {
        successful: true,
        message: "No Valid assignment found"
    }
    const notion_exec_output = await logToNotion(parse_output.prop, user_id, settings.notion_database_id);
    if (!notion_exec_output.successful) return notion_exec_output;
    return {
        successful: true,
        message: "Assignment added to notion"
    };

}

export { handleMailTrigger };