import axios from 'axios';
import { queryProfessorData } from './pinecone';

export const generateResponseWithRAG = async (messages) => {
  try {
    // Retrieve relevant professor data from Pinecone based on the user's query
    const pineconeContext = await queryProfessorData(messages[0].content);

    // Construct a detailed prompt with the retrieved metadata
    const enhancedMessages = [
      ...messages,
      {
        role: "system",
        content: `Context: ${pineconeContext.map(context => `${context.name} from ${context.school} in the ${context.department} department. Rating: ${context.rating}, Difficulty: ${context.difficulty}, Would take again: ${context.would_take_again}%`).join(' ')}`
      }
    ];

    // Query LLaMA with the enhanced context
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: enhancedMessages,
        temperature: 1.5,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('🔴 Error querying LLaMA with RAG:', error);
    throw new Error('Error querying LLaMA API with RAG');
  }
};