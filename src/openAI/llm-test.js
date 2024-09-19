import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import {ChatOpenAI} from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser }  from '@langchain/core/output_parsers'
import { Document } from '@langchain/core/documents'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { AIMessage, HumanMessage, BaseMessage } from '@langchain/core/messages'
import { MessagesPlaceholder } from '@langchain/core/prompts'
import { ConversationChain } from 'langchain/chains';
import User from '../helpers/userDb.js';

// Create Conversation Chain
const loadUserHistory = async(userId) => {
    const user = await User.findOne({id: userId});
    if(user && user.chatHistory) {
        return user.chatHistory.map((msg) => {
            if (msg.role === 'user') {
                return new HumanMessage(msg.content);
            } else if (msg.role === 'assistant' || msg.role === 'ai') {
                return new AIMessage(msg.content);
            } else {
                throw new Error('Invalid message role'); // Ensure roles are correct
            }
        })
    }
    return [];
}

const saveUserHistory = async(userId, chatHistory) => {
    await User.updatedOne(
        { userId },
        { $set: { chatHistory, updatedAt: Date.now()}},
        { upsert: true}
    )
}

const createChain = async (userId) => {
  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    maxTokens: 1000,
    verbose: true,
  });

  
  // Initialize Memory (to handle chat history)
  const chatHistoryData = await loadUserHistory(userId);

  const chatHistory = new ChatMessageHistory({
    messages: chatHistoryData.length > 0 ? chatHistoryData : [],
  })

  console.log(`Here,`,chatHistory);
  console.log(chatHistory instanceof BaseMessage);
  console.log('here');

  const memory = new BufferMemory({
    memoryKey: 'chat_history',
    returnMessages: true,
    inputKey: 'input',
    chatHistory: chatHistory,
  })

// Create prompt template
const prompt = ChatPromptTemplate.fromMessages([
    { role: 'system', content: "Answer the user's input" },
    ...(chatHistoryData.length > 0
        ? [new MessagesPlaceholder('chat_history')]
        : []),
    { role: 'user', content: "{input}" },
     // For chat history
    ]);
    
    console.log('here1');
  // Create the Conversation Chain
  const chain = new ConversationChain({
    prompt,
    llm: model,
    memory: memory,
    inputKey: 'input',
  });

  console.log('here2');

  return chain;
};

export const new_textGenerator = async (userId, prompt) => {
    const chain = await createChain(userId);
    const response = await chain.call({
        input: prompt,
    });
    console.log('here3');
    console.log(response);
    await saveUserHistory(userId, response.chat_history);
    return response;
}

console.log(new_textGenerator)