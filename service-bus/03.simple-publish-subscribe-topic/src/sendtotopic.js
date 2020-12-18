const { connectionString, topicName } = require('./config');
const { ServiceBusClient } = require("@azure/service-bus");

const messages = [
    { body: "S1, Store1 Albert Einstein", applicationProperties: { StoreId: "Store1" } },
    { body: "S1, Store2 Werner Heisenberg", applicationProperties: { StoreId: "Store2" } },
    { body: "S1, Store3 Marie Curie", applicationProperties: { StoreId: "Store3" } },
    { body: "S2, Store4 Steven Hawking", applicationProperties: { StoreId: "Store4" } },
    { body: "S2, Store4 Isaac Newton", applicationProperties: { StoreId: "Store4" } },
    { body: "S3, Store5 Niels Bohr", applicationProperties: { StoreId: "Store5" } },
    { body: "S3, Store6 Michael Faraday", applicationProperties: { StoreId: "Store6" } },
    { body: "S3, Store7 Galileo Galilei", applicationProperties: { StoreId: "Store7" } },
    { body: "S3, Store8 Johannes Kepler", applicationProperties: { StoreId: "Store8" } },
    { body: "Not set StoreId, expected will be missing" },
];


async function main() {
    // create a Service Bus client using the connection string to the Service Bus namespace
    const sbClient = new ServiceBusClient(connectionString);

    // createSender() can also be used to create a sender for a queue.
    const sender = sbClient.createSender(topicName);

    try {
        // Tries to send all messages in a single batch.
        // Will fail if the messages cannot fit in a batch.
        // await sender.sendMessages(messages);

        // create a batch object
        let batch = await sender.createMessageBatch();
        for (let i = 0; i < messages.length; i++) {
            // for each message in the arry			

            // try to add the message to the batch
            if (!batch.tryAddMessage(messages[i])) {
                // if it fails to add the message to the current batch
                // send the current batch as it is full
                await sender.sendMessages(batch);

                // then, create a new batch 
                batch = await sender.createBatch();

                // now, add the message failed to be added to the previous batch to this batch
                if (!batch.tryAddMessage(messages[i])) {
                    // if it still can't be added to the batch, the message is probably too big to fit in a batch
                    throw new Error("Message too big to fit in a batch");
                }
            }
        }

        // Send the last created batch of messages to the topic
        await sender.sendMessages(batch);

        console.log(`Sent a batch of messages to the topic: ${topicName}`);

        // Close the sender
        await sender.close();
    } finally {
        await sbClient.close();
    }
}

// call the main function
main().catch((err) => {
    console.log("Error occurred: ", err);
    process.exit(1);
});    