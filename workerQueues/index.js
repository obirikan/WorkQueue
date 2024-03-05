// Import the AMQP library, which is a standard for messaging middleware and used here to interact with RabbitMQ.
const amqplib = require('amqplib');

// Define the name of the queue to which the message will be sent.
const queueName = "task";

// Get the message to send from the command line arguments. If no message is provided, use "Hello World!" as a default.
const msg = process.argv.slice(2).join(' ') || "Hello World!";

// RabbitMQ connection URL, including credentials (username, password, and server details).
const url=process.env.AMQP_URL;

// Asynchronous function to send a task/message.
const sendTask = async () => {
  // Establish a connection to the RabbitMQ server using the connection URL.
  const connection = await amqplib.connect(url);
  
  // Create a channel on the established connection for communication with RabbitMQ.
  const channel = await connection.createChannel();
  
  // Ensure the queue exists before attempting to send a message to it.
  // 'durable: true' makes the queue persistent, meaning it won't be lost if RabbitMQ restarts.
  await channel.assertQueue(queueName, {durable: true});
  
  // Send the message to the specified queue. The message is sent as a Buffer.
  // 'persistent: true' marks the message as persistent, helping it survive broker restarts.
  channel.sendToQueue(queueName, Buffer.from(msg), {persistent: true});
  
  // Log the sent message to the console.
  console.log('Sent: ', msg);
  
  // Set a timeout to close the connection and exit the process. This delay ensures that
  // the message has enough time to be sent before closing the connection.
  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500)
}

// Execute the sendTask function to send the message.
sendTask();