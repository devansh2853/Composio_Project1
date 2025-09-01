import composio from './utils/composio.js';
let gemini_output = '```json\n' +
    '[\n' +
    '  {\n' +
    '    "Assignment name": "Assignment 11",\n' +
    '    "Assignment Subject/Course": "Entrepreneurship Essentials",\n' +
    '    "Due Date": "09/04/2025",\n' +
    '    "MessageID": null\n' +
    '  },\n' +
    '  {\n' +
    '    "Assignment name": "Assignment 12",\n' +
    '    "Assignment Subject/Course": "Entrepreneurship Essentials",\n' +
    '    "Due Date": "16/04/2025",\n' +
    '    "MessageID": null\n' +
    '  },\n' +
    '  {\n' +
    '    "Assignment name": "Assignment 10",\n' +
    '    "Assignment Subject/Course": "Entrepreneurship Essentials",\n' +
    '    "Due Date": "02/04/2025",\n' +
    '    "MessageID": null\n' +
    '  },\n' +
    '  {\n' +
    '    "Assignment name": "Assignment 9",\n' +
    '    "Assignment Subject/Course": "Entrepreneurship Essentials",\n' +
    '    "Due Date": "26/03/2025",\n' +
    '    "MessageID": null\n' +
    '  },\n' +
    '  {\n' +
    '    "Assignment name": "Assignment 11",\n' +
    '    "Assignment Subject/Course": "Privacy and Security in Online Social Media",\n' +
    '    "Due Date": "09/04/2025",\n' +
    '    "MessageID": null\n' +
    '  },\n' +
    '  {\n' +
    '    "Assignment name": "Assignment 10",\n' +
    '    "Assignment Subject/Course": "Privacy and Security in Online Social Media",\n' +
    '    "Due Date": "02/04/2025",\n' +
    '    "MessageID": null\n' +
    '  }\n' +
    ']\n' +
    '```\n';

    
let cleaned = gemini_output.replace(/```json\n?/, '').replace(/```\n?$/, '').replace(/\\n/g, '\n').replace(/\\'/g, "'");
// console.log(ass_list);
// console.log(cleaned);

const resp_object_list = JSON.parse(cleaned);
let props = [];
for (let i = 0; i < resp_object_list.length; i++) {
    let date_val = resp_object_list[i]["Due Date"].split('/').reverse();
    const correct_date = date_val.join('-')

    const name_obj = {
        name: "Name",
        type: "title",
        value: resp_object_list[i]["Assignment name"]
    };
    const due_date_obj = {
        name: "Due Date",
        type: "date",
        value: correct_date
    };
    const sub_obj = {
        name: "course/subject",
        type: "rich_text",
        value: resp_object_list[i]["Assignment Subject/Course"]
    };
    let prop_i = [];
    prop_i.push(name_obj);
    prop_i.push(due_date_obj);
    prop_i.push(sub_obj);
    props.push(prop_i);
}
console.log(props);

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