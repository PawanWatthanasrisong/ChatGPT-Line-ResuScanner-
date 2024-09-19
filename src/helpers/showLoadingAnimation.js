
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


const lineConfig = {
    channelAccessToken: process.env.ACCESSTOKEN,
    channelSecret: process.env.SECRETCODE
}


//loading animation
const showLoadingAnimation = async (userId, duration) => {
    const response = await axios.post('https://api.line.me/v2/bot/chat/loading/start', {
        chatId: userId,
        loadingSeconds: duration
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lineConfig.channelAccessToken}`
        }
    });
}

export  {
    showLoadingAnimation,
};