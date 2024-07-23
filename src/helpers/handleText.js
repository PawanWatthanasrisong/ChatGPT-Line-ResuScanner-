const { textGenerator } = require('../openAI/openAI.js');
const User = require('./userDb.js');

//variable
const handleText = async (prompt, replyToken, userId, client) => {
    const user = await User.findOne({id: userId});
    const chatResponse = await textGenerator(prompt, user.sessionContexts);
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

module.exports = { handleText };