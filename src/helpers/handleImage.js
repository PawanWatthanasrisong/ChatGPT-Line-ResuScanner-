// Import named export from your own module
import { textGeneratorWithImage } from '../openAI/openAI.js';

// If User is a default export, import it like this
import User from './userDb.js';  // Change to named import if User is a named export

// Node.js built-in modules (fs and path) - No need to change their import method
import fs from 'fs';
import path from 'path';

// axios is a default export, import it like this
import axios from 'axios';

// AWS SDK default export
import AWS from 'aws-sdk';

import * as line from '@line/bot-sdk'; // Use named imports if necessary

import { fileURLToPath } from 'url';

//AWS 
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACESS_KEY,
})
const s3 = new AWS.S3();


//Line Config
const lineConfig = {
    channelAccessToken: process.env.ACCESSTOKEN,
    channelSecret: process.env.SECRETCODE
}

//Download Image to AWS
const downloadToAWS = async(data, messageId) => {
    const signedUrlExpireSeconds = 60;
    const downloadData = await s3.upload({
        Bucket: "chatgpt-line-resuscanner",
        Key: `${messageId}.jpg`,
        Body: data,
        ContentType: 'image/jpeg'
    }).promise();

    console.log(`File uploaded succesfully.`);
    
    const url = s3.getSignedUrl('getObject', {
        Bucket: "chatgpt-line-resuscanner",
        Key: `${messageId}.jpg`,
        Expires: signedUrlExpireSeconds
    })

    console.log(url);

    return url;
}

//Image Download Folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory path
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
    //const imagePath = downloadImage(response.data, messageId);

    //Download to AWS
    const imageURL = await downloadToAWS(response.data, messageId);

    //encode
    //const base64Image = encodeImage(imagePath);

    //ResponseFrom ChatGPT
    const chatResponse = await textGeneratorWithImage(prompt, imageURL);

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

export { handleImage, downloadDir };


