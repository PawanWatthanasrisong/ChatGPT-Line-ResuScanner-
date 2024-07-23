const { textGeneratorWithImage } = require('../openAI/openAI.js');
const User = require('./userDb.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

//Line Config
const lineConfig = {
    channelAccessToken: process.env.ACCESSTOKEN,
    channelSecret: process.env.SECRETCODE
}

//Image Download Folder
const downloadDir = path.join(path.dirname(path.dirname(__dirname)), 'download');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

const handleImage = async(prompt, replyToken, messageId, userId, client) => {
    
    const user = await User.findOne({id: userId});

    const response = await axios.get(`https://api-data.line.me/v2/bot/message/${messageId}/content`,{
        headers: {
            'Authorization': `Bearer ${lineConfig.channelAccessToken}`
            },
            responseType: 'arraybuffer'
        },
    );


    // Save the download file and get the URL 
    const imagePath = downloadImage(response.data, messageId);

    //encode
    const base64Image = encodeImage(imagePath);

    //ResponseFrom ChatGPT
    const chatResponse = await textGeneratorWithImage(prompt, base64Image);

    user.sessionContexts = chatResponse;
    await user.save();
    
    return await client.replyMessage({
        replyToken: replyToken,
        messages: [{
            type: 'text',
            text: chatResponse
                }]
            })
}

const downloadImage = (imageData, messageId) => {
    const dlpath = path.join(downloadDir, `${messageId}.jpg`);
    fs.writeFileSync(dlpath, imageData);
    console.log(`File saved to ${dlpath}`);

    //return path
    console.log(dlpath);
    return dlpath;
}

const encodeImage = (imagePath) =>  {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
}

module.exports = { handleImage, downloadDir };


