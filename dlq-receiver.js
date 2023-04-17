import {  ServiceBusClient } from "@azure/service-bus";

// Define the connection string and queue name
const connectionString =
  "Endpoint=sb://xzxdsdsdzz.servicebus.windows.net/;SharedAccessKeyName=dlq-receiver;SharedAccessKey=xQJus9XeSbVHnJnq3LGXKWNNxe2t7UfVL+ASbE2UWSI=;EntityPath=null";
const queueName = "null";

// Define the options for receiving messages from the DLQ

// Create a ServiceBusClient instance
const sbClient = new ServiceBusClient(connectionString);

// Create a receiver for the DLQ
const dlqReceiver = sbClient.createReceiver(queueName, {
  subQueueType: "deadLetter",
});

// Define a function to process each DLQ message
async function processMessage(message) {
  console.log(`Received message: ${message.body}`);

  // Complete the message to remove it from the DLQ
  await dlqReceiver.completeMessage(message);
}

// Define a function to handle any errors that occur while processing messages
async function processError(err) {
  console.error(err);
}

// Start receiving messages from the DLQ in a loop
async function receiveMessages() {
  while (true) {
    try {
      console.log(`Attempting to peek 100000 messages at a time`);
      const messages = await dlqReceiver.receiveMessages(100000, {
        maxWaitTimeInMs: 60 * 1000,
      });
      console.log(`Got ${messages.length} messages.`);
      if (messages.length === 0) {
        // No messages were received within the max wait time, continue looping
        continue;
      }
      // Process each received message
      for (let i = 0; i < messages.length; i++) {
        await processMessage(messages[i]);
      }
    } catch (err) {
      // Handle any errors that occur while receiving messages
      await processError(err);
    }
  }
}

// Call the receiveMessages function to start the loop
receiveMessages().catch(processError);
