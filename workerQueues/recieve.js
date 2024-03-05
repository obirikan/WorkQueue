// Require the AMQP library to interact with RabbitMQ.
const amqplib = require('amqplib');

// Name of the queue from which messages will be consumed.
const queueName = "task";

// The connection URL to the RabbitMQ server, including credentials.
const url=process.env.AMQP_URL;

// Asynchronous function to consume tasks.
const consumeTask = async () => {
  // Establish a connection to the RabbitMQ server using the provided URL.
  const connection = await amqplib.connect(url);
  
  // Create a communication channel over the established connection.
  const channel = await connection.createChannel();
  
  // Ensure that the queue exists before consuming messages from it.
  // 'durable: true' makes sure the queue persists even if the broker restarts.
  await channel.assertQueue(queueName, {durable: true});
  
  // This line sets the prefetch count to 1, which means that this consumer
  // will not be given more than one message to process at a time. This is part
  // of implementing fair dispatch to ensure tasks are evenly distributed
  // among multiple consumers.
  channel.prefetch(1);
  
  // Log to the console that the consumer is waiting for messages in the specified queue.
  console.log(`Waiting for messages in queue: ${queueName}`);
  
  // Start consuming messages from the specified queue.
  channel.consume(queueName, msg => {
    // Simulate a task duration based on the content of the message.
    // For example, a message with content "Message..." (3 dots) will simulate
    // a 3-second task. This is just a placeholder for actual task processing.
    const secs = msg.content.toString().split('.').length - 1;
    console.log("[X] Received:", msg.content.toString());
    
    // Simulate task processing time using setTimeout.
    setTimeout(() => {
      console.log("Done with task");
      
      // Once processing is complete, acknowledge the message to remove it from the queue.
      // This signals to RabbitMQ that the message has been successfully processed.
      channel.ack(msg);
    }, secs * 1000);
  }, {noAck: false}) // 'noAck: false' means acknowledgments are required,
                     // meaning messages must be manually acknowledged using `channel.ack()`.
}

// Call the consumeTask function to start the consumer.
consumeTask();