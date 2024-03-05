// Require the amqplib package to interact with RabbitMQ
const amqplib = require('amqplib');
// Load environment variables from a .env file
require('dotenv').config()

// Define the name of the exchange to which messages will be published
const exchangeName = "logs";

// Construct the message from command line arguments or use a default message if none are provided
const msg = process.argv.slice(2).join(' ') || 'Subscribe, Like, & Comment';

// RabbitMQ connection string (ensure this is securely managed, consider using environment variables)
const url='amqps://gneethvs:zsKA5Qi536KeFPlbCMn37snS_Nw2yLhr@toad.rmq.cloudamqp.com/gneethvs'

// Asynchronous function to publish a message
const sendMsg = async () => {
  // Establish a connection to RabbitMQ server
  const connection = await amqplib.connect(url);
  // Create a channel on this connection
  const channel = await connection.createChannel();
  
  // Assert an exchange exists with a name, type 'fanout', and durability as false
  // 'fanout' means the message will be broadcasted to all queues bound to this exchange
  await channel.assertExchange(exchangeName, 'fanout', {durable: false});
  
  // Publish the message to the exchange with an empty routing key, meaning it will go to all queues
  channel.publish(exchangeName, '', Buffer.from(msg));
  console.log('Sent: ', msg);
  
  // Close the connection after a short delay to ensure the message is sent
  setTimeout(() => {
    connection.close();
    process.exit(0); // Exit the process to prevent hanging
  }, 500)
}

// Execute the sendMsg function to send the message
sendMsg();