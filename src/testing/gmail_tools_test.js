import composio from './utils/composio.js';
const my_id = "devansh_student";

async function readMail(userid) {
    const emails = await composio.provider.executeTool(
  "GMAIL_FETCH_EMAILS",
  {
    userId: userid,   // required
    arguments: {
      query: "assignment OR task", 
      maxResults: 5
    }
  }
);
    return emails;
}

async function readMailTool(userid) {
    const emails = await composio.tools.execute(
        "GMAIL_FETCH_EMAILS",
        {
            userId: userid,   // required
            arguments: {
                query: "Assignment live",
                maxResults: 5
            }
        }
    );
    return emails;
}

async function sendMail(userid) {
    const mail_body = "Hello, this is a tester mail";
    const mail_subject = "Composio test";
    const sendResult = await composio.provider.executeTool(
        "GMAIL_SEND_EMAIL",
        {
            userId: userid,
            arguments: {
                body: mail_body,
                subject: mail_subject,
                recipient_email: "ishitabansal484@gmail.com",
            }
        }
    );
    return sendResult;
}

// const emails = await readMail(my_id);
// console.log(emails.data);
// const mailResult = sendMail(my_id);
// console.log(mailResult);

const emails = await readMailTool(my_id);
console.log(emails.data);