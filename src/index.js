import express from 'express';
import * as line from '@line/bot-sdk';
import mongoose from 'mongoose'; // No need for destructuring, import default
import { handleEvents } from './helpers/handleEvents.js';
import { downloadDir } from './helpers/handleImage.js';
import dotenv from 'dotenv';
import User from './helpers/userDb.js'
dotenv.config();



const app = express();

//database connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Database Connected'))
    .catch((err) => console.log('Database still is not connected', err))


//PORT
const PORT = process.env.PORT;

//config for line
const lineConfig = {
    channelAccessToken: process.env.ACCESSTOKEN,
    channelSecret: process.env.SECRETCODE
}

console.log(lineConfig);

const printHello = (req,res,next) => {
    console.log(`Hello`);
    next();
}

// Sever static files from the 'download' directory
app.use('/images', express.static(downloadDir));

//API webhook
app.post('/webhook', printHello , line.middleware(lineConfig), async(req, res, next) => {
    try{
        const { events } = req.body;
        console.log('event>>>>>');
        if (events[0] == undefined) {
            console.log(`here`);
            return res.status(200).json('No Event');
        } else if (events[0].type !== 'message') {
            return res.status(200).json('Not Message');
        }
        console.log('Here');
        return  await events.map(event => handleEvents(event)) || res.status(200).json('ok');
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error
        });
    }
});

app.get('/', (req, res) => res.json('hi'));

//Listen to PORT
app.listen(PORT, () => console.log(`Start server on port ${PORT}`));

