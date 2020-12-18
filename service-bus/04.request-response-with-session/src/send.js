const { connectionString, queueName } = require('./config');
const { ServiceBusClient } = require("@azure/service-bus");
const prompt = require('prompt-sync')({sigint: true});

async function main() {
    const sbClient = new ServiceBusClient(connectionString);
    const sessionId = 'session-' + (Math.floor(Math.random() * 6) + 1);

    console.log(sessionId);

    try {
        while (true) {
            const mess = prompt('Enter your message: ');
            
            if(mess==='exit') break;

            await sendMessage(sbClient, mess, sessionId).then((v) => console.log('data', v));
        }
    } finally {
        await sbClient.close();
    }
}

async function sendMessage(sbClient, mess, sessionId) {
    // createSender() also works with topics
    const sender = sbClient.createSender(queueName);

    const message = {
        body: mess,
        subject: "Demo Session",
        sessionId: sessionId
    };

    console.log(`Sending message: "${message.body}" to "${sessionId}"`);
    await sender.sendMessages(message);

    await sender.close();
}

main().catch((err) => {
    console.log("Error occurred: ", err);
    process.exit(1);
});
