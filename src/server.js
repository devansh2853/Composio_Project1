import express from "express";
import { handleMailTrigger } from './MailToNotionLog.js';

const app = express();
app.use(express.json());

// This is the webhook endpoint that will receive Gmail trigger events
app.post("/gmail-webhook", async (req, res) => {
    // console.log("📩 Gmail trigger received:", req.body);
    console.log("Gmail trigger received");
    try {
        const handleTrigger = await handleMailTrigger(req.body.data);
        if (!handleTrigger.successful) {
            console.log(handleTrigger.error);
            res.status(500).send("Error handling mail trigger");
        }
        else {
            console.log("Trigger successfully handled");
            res.status(200).send(handleTrigger.message);
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error handling mail trigger");
    }
    
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
