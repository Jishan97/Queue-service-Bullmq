const express = require('express')
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis')
const mongoose = require('mongoose');

const connection = new IORedis({
    port: process.env.redis_port,
    host: process.env.redis_host,
    username: process.env.redis_username,
    password: process.env.redis_password,
    db: 0,
    maxRetriesPerRequest: null
});



connection.on("connect", () => {
    console.log("Successfully connected to Redis");
});

mongoose.connect(process.env.mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB via Mongoose"))
    .catch(err => console.error("Mongoose connection error:", err));

const HesaInstitutionSchema = new mongoose.Schema({}, { strict: false });
const HesaInstitution = mongoose.model('HesaInstitution', HesaInstitutionSchema, 'hesa_institution');


const myFirstQueue = new Queue('myFirstQueue', { connection });

const myFirstWorker = new Worker('myFirstQueue', async job => {
    const start = Date.now();
    console.log(`Worker starting heavy task at: ${new Date(start).toISOString()}`)

    const data = await HesaInstitution.find({});
    const idsArray = data.map(doc => doc._id);

    console.log(`Fetched ${data.length} documents. IDs:`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    const end = Date.now();
    console.log(`Worker finished heavy task at: ${new Date(end).toISOString()}`);
    console.log(`Total task duration: ${(end - start) / 1000} seconds`);
}, {
    connection,
    concurrency: 100

});

myFirstWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed`);
})


const app = express()



app.get('/', (req, res) => {
    console.log('Queue')
    res.send('Queue')
})

app.get('/queue', async (req, res) => {
    console.log('Queue')
    await myFirstQueue.add('paint', { color: 'red' });

    res.send('Queue')
})


app.listen(4000, () => {
    console.log('Running on port 4000')
})