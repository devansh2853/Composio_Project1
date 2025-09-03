import readline from 'readline';
import composio from "../utils/composio.js";

const userId = "devansh_student";
const notion_auth_config_id = 'ac_ynlCvPhqxaiw';

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    }));
}

async function authenticateToolkit(userId, authConfigId) {
    try {
        const connectionRequest = await composio.connectedAccounts.initiate(
            userId,
            authConfigId
        );
        console.log(`Visit this URL to authenticate Notion: ${connectionRequest.redirectUrl}`);

        await connectionRequest.waitForConnection(300000);
        return connectionRequest.id;
    }
    catch(err) {
        if (err.name === 'ConnectionRequestTimeoutError') {
            const failed_account = await composio.connectedAccounts.list({ userIds: [userId] });
            await composio.connectedAccounts.delete(failed_account.items[0].id);
            let ans;
            ans = await askQuestion("Connection timed out. Would you like to retry?(y/n)");
            if (ans == 'y') {
                return authenticateToolkit(userId, authConfigId);
            }
            else {
                return 0;
            }
        }
        else if (err.name === 'ComposioMultipleConnectedAccountsError') {
            const accounts_list = await composio.connectedAccounts.list({userIds: [userId]});
            // console.log(accounts_list.items[0].toolkit);
            const account_id = accounts_list.items[0].id;
            if (accounts_list.items[0].status != 'ACTIVE') {
                await composio.connectedAccounts.delete(account_id);
                console.log("Account was incompletely connected and is now deleted");
                let ans = await askQuestion("Would you like to try again?(y/n)");
                if (ans == 'y') {
                    return authenticateToolkit(userId, authConfigId);
                }
                else {
                    return 0;
                }
            }
            else {
                console.log("The account is already connected");
                return account_id;
            }
        }

    }
    
}

const connectionId = await authenticateToolkit(userId, notion_auth_config_id);

if (connectionId == 0) {
    console.log("Connection Failed");
}

else {
    const connectedAccount = await composio.connectedAccounts.get(connectionId);
    console.log("Connected account:", connectedAccount);

}