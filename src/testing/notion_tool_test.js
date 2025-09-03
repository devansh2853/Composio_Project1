import composio from '../utils/composio.js';
const my_id = "devansh_student";

// async function addRow(userid) {
//     const createdb = await composio.tools.execute(
//   "NOTION_INSERT_ROW_DATABASE",
//         {
//         dtabase_id: "a253316f3f1349fc9b9224e2a0ee7f1d",
//         userId: userid,   // required
//         arguments: {
//             query: "assignment OR task", 
//             maxResults: 5
//         }
//   }
//     );
//     const addrow = await composio.tools.execute(
//         "NOTION_INSERT_ROW_DATABASE",
//         {

//         }
//     )
//     return emails;
// }

const notion_db_id = "a253316f3f1349fc9b9224e2a0ee7f1d";
async function addRow(userId) {
  try {
    const addRowResponse = await composio.tools.execute(
      "NOTION_INSERT_ROW_DATABASE",
      {
        userId: userId,
        arguments: {
          database_id: notion_db_id,
          properties: {
            "Title": {
              title: [
                {
                  text: { content: "Sample Assignment" }
                }
              ]
            },
            "Due Date": {
              date: { start: "2025-09-05" }
            },
            "Status": {
              select: { name: "Pending" }
            },
            "Notes": {
              rich_text: [
                {
                  text: { content: "Fetched from Gmail" }
                }
              ]
            }
          }
        }
      }
    );
      return addRowResponse;

    console.log("Inserted row:", JSON.stringify(addRowResponse, null, 2));
  } catch (err) {
    console.error("Error inserting row:", err);
  }
}

// const rowAddition = await addRow(my_id);
// console.log(rowAddition);
const props = [
    { name: "Name", type: "title", value: "NPTEL Week 4 Quiz" },     // required
    { name: "Due Date", type: "date", value: "2025-09-05" },            // ISO date (YYYY-MM-DD)
    { name: "status", type: "select", value: "Pending" },               // must exist in Notion options
    { name: "Email Link", type: "url", value: "https://mail.google.com/mail/u/0/#inbox/THREAD_ID" },
    { name: "Notes", type: "rich_text", value: "Auto-logged from Gmail. Check instructions in the email." },
    { name: "course/subject", type: "rich_text", value: "Data Structures" },
    { name: "Title", type: "rich_text", value: "Assignment 1" },
];
const exec = await composio.tools.execute("NOTION_INSERT_ROW_DATABASE", {
  connectedAccountId: "ca_MMtlVQ3pCGkD",
  userId: my_id,
  arguments: {
    database_id: "a253316f3f1349fc9b9224e2a0ee7f1d",
    properties: [
      {
        name: "Name",   // field name in your DB
        type: "title",  // required type
        value: "Test row from Composio 4"
        }
    ]
  }
});

console.log(exec);


