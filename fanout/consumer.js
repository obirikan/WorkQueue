// Include the amqplib package to work with RabbitMQ
const amqplib = require('amqplib');

// Define the name of the exchange
const exchangeName = "logs";

// RabbitMQ connection string (should be kept secure, possibly in environment variables)
const url='amqps://'

// Asynchronous function to receive messages for the first consumer
const recieveMsg = async () => {
  // Establish connection to the RabbitMQ server
  const connection = await amqplib.connect(url);
  // Create a communication channel
  const channel = await connection.createChannel();
  // Assert that the exchange exists with type 'fanout' and it's not durable
  await channel.assertExchange(exchangeName, 'fanout', {durable: false});
  // Assert a queue with a generated name that is exclusive to this connection
  const q = await channel.assertQueue('', {exclusive: true});
  
  console.log(`Waiting for messages in queue: ${q.queue}`);
  // Bind the queue to the exchange with no specific routing key
  channel.bindQueue(q.queue, exchangeName, '');
  // Start consuming messages from the queue without acknowledgments
  channel.consume(q.queue, msg => {
    if(msg.content) console.log("consumer 1: ", msg.content.toString());
  }, {noAck: true})
}

// Execute the first consumer's receive function
recieveMsg();

// Asynchronous function to receive messages for the second consumer
const recieveMsg2= async () => {
    // Establish connection to the RabbitMQ server
    const connection = await amqplib.connect(url);
    // Create a communication channel
    const channel = await connection.createChannel();

    // Assert that the exchange exists with type 'fanout' and it's not durable
    await channel.assertExchange(exchangeName, 'fanout', {durable: false});

    // Assert a queue with a generated name that is exclusive to this connection
    const q = await channel.assertQueue('', {exclusive: true});
    
    console.log(`Waiting for messages in consumer 2 queue: ${q.queue}`);
    
    // Bind the queue to the exchange with no specific routing key
    channel.bindQueue(q.queue, exchangeName, '');

    // Start consuming messages from the queue without  acknowledgments(does not delete msg)
    
    channel.consume(q.queue, msg => {
      if(msg.content) console.log("consuming 2: ", msg.content.toString());
    }, {noAck: true})
}

// Execute the second consumer's receive function
recieveMsg2()