import { new_textGenerator } from '../openAI/llm-test.js';
import { textGenerator } from '../openAI/openAI.js';
import * as line from '@line/bot-sdk'; // Use named imports if necessary


// Import the default export (if User is a default export in userDb.js)
import User from './userDb.js';  // Change this if User is a named export
//variable
const lineConfig = {
    channelAccessToken: process.env.ACCESSTOKEN,
    channelSecret: process.env.SECRETCODE
}

//create client
const client = new line.messagingApi.MessagingApiClient(lineConfig);
//const client = new line.Client(lineConfig);

const handleText = async (prompt, replyToken, userId, client) => {
    const user = await User.findOne({id: userId});
    const chatResponse = await new_textGenerator(userId, prompt);
    console.log(chatResponse);
    user.sessionContexts = chatResponse;
    await user.save();

    //reply
    return await client.replyMessage({
    replyToken: replyToken,
    messages: [{
        type: 'text',
        text: chatResponse
            }]
        })
    }

export { handleText };