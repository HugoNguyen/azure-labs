const { connectionString, queueName } = require('./config');
const { ServiceBusClient, delay } = require("@azure/service-bus");
const prompt = require('prompt-sync')({sigint: true});

async function main() {
    const sbClient = new ServiceBusClient(connectionString);
    const sessionId = prompt('Enter session: ');

    console.log(`Connected to ${sessionId}`);

    try {
        await receiveMessages(sbClient, sessionId);
    } finally {
        await sbClient.close();
    }
}

async function receiveMessages(sbClient, sessionId) {
    // If receiving from a subscription you can use the acceptSession(topic, subscription, sessionId) overload
    const receiver = await sbClient.acceptSession(queueName, sessionId);

    const processMessage = async (message) => {
        console.log(`Received: ${message.sessionId} - ${message.body} `);
    };
    const processError = async (args) => {
        console.log(`>>>>> Error from error source ${args.errorSource} occurred: `, args.error);
    };

    receiver.subscribe({
        processMessage,
        processError
    });

    await delay(60000);

    await receiver.close();
}


main().catch((err) => {
    console.log("Error occurred: ", err);
    process.exit(1);
});