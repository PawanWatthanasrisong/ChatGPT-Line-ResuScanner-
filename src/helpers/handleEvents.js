require('dotenv').config();
const line = require('@line/bot-sdk');
const axios = require('axios');
const  { textGenerator } = require('../openAI/openAI.js');
const { showLoadingAnimation } = require('./showLoadingAnimation.js');
const { handleText } = require('./handleText.js');
const { handleImage } = require('./handleImage.js');
const User = require('./userDb.js');

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



module.exports = {
    handleEvents,
};