// Import from '@langchain/openai'
import { ChatOpenAI } from '@langchain/openai'; // Assuming it's a default export

// Import from 'openai'
import OpenAI from 'openai'; // Assuming it's a default export

// Import axios
import axios from 'axios'; // axios is a default export

const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,

})

const response = await model.invoke('Hello');
console.log(response);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

async function textGenerator(prompt, context) {
    const contextMessage = (!context) ? "" : `This is assistant(you) previous response "${context}."`
    console.log(`${contextMessage} This is the user's prompt "${prompt}"`);
    const response = await openai.chat.completions.create({
        messages: [{
            role: 'system',
            content: 'You are helpful assistant. You will guide user about their resume and tell them step by step how to improve it. You can only speak English. You are created to help just about resume not other topic and you have to tell user to ask only about resume.'
        },
    {   
        role: 'user',
        content: `${contextMessage}. This is the user's prompt "${prompt}"`
    }],
    model: "gpt-3.5-turbo"
    })
    return response.choices[0].message.content;
}

async function textGeneratorWithImage(prompt, imageURL, context) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: [
                    {
                        "type": "text",
                        "text": "Analyze this Resume"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": imageURL
                        }
                    }
                ]
            },
            {
                role: "system",
                content: 'You are helpful assistant. You will guide user about their resume and tell them step by step how to improve it. You can only speak English. You are created to help just about resume not other topic and you have to tell user to ask only about resume.'
            }
        ]
    })
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
}

async function ImageGenerator(prompt, context) {
    const combinedPrompt = context + " " + prompt;
    console.log(combinedPrompt);
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: combinedPrompt,
        n:1,
        size: "1024x1024"
    });
    image_url = response.data[0].url;
    return image_url;
}

export { ImageGenerator, textGenerator, textGeneratorWithImage };