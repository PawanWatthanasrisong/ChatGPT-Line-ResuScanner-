
// Import modules using ES module syntax
import * as line from '@line/bot-sdk'; // Use named imports if necessary
import axios from 'axios';

// Import your own modules
import { textGenerator } from '../openAI/openAI.js';
import { showLoadingAnimation } from './showLoadingAnimation.js';
import { handleText } from './handleText.js';
import { handleImage } from './handleImage.js';
import User from './userDb.js';
import dotenv from 'dotenv';
dotenv.config();

const lineConfig = {
    channelAccessToken: process.env.ACCESSTOKEN,
    channelSecret: process.env.SECRETCODE
}

//create client
const client = new line.messagingApi.MessagingApiClient(lineConfig);
//const client = new line.Client(lineConfig);


const handleEvents = async(event) => {
    console.log(event);
    const prompt = event.message.text;

    const { userId } = event.source;
    
    let user = await User.findOne({id: userId});

    if(!user) {
        user = await User.create({
            id: userId, sessionContexts: '', activateBot: false });
    } 

    console.log(user);

    if (prompt === `Stop bot`) {
        user.sessionContexts = "";
        user.activateBot = false; 
        await user.save();
        return await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{
                type: 'text',
                text: `Bot Stopped! Type 'Start bot' To start bot again!"`
            }]
        })
    } else if (prompt === 'Start bot') {
        user.activateBot = true;
        await user.save();
        console.log(user);
        return await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{
                type: 'text',
                text: `Bot Start now! Please make the prompt!\nRemember! I am a Resume Helper Assitant, So I can only answer about the Resume Questions!!! "`
            }]
        })
    }

    
    if (!user.activateBot) {
        console.log(`Bot not activated`);
        return await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{
                type: 'text',
                text: `Please activate bot by "Start bot"`
            }]
        })
    }

    if (event.message.type === 'image') {
        //loading animation
        showLoadingAnimation(userId, 30);
        handleImage(prompt, event.replyToken, event.message.id ,userId, client);
    }
    
    else if (event.message.type === 'text') {
        //loading animation
        showLoadingAnimation(userId, 30);
        handleText(prompt, event.replyToken , userId, client);
        }
        
}



export  {
    handleEvents,
};