import { queryProfessorData } from './pinecone';
import axios from 'axios';

// Generate a response using LLaMA with context from Pinecone
export const generateResponseWithRAG = async (messages) => {
  try {
    // Extract the query text from the messages
    const queryText = messages[0].content;

    // Assume queryText is in the format "Professor Name, School Name"
    const [professorName, schoolName] = queryText.split(',').map(s => s.trim());

    // Check if either schoolName or professorName is missing
    if (!schoolName || !professorName) {
      console.warn('🟡 Missing required parameters: schoolName or professorName');
      return {
        response: 'Please provide both the professor name and the school name.',
      };
    }

    // Retrieve relevant context from Pinecone
    const pineconeContext = await queryProfessorData({ schoolName, professorName });
    console.log('Pinecone Context:', pineconeContext);

    // If context is found, construct a detailed prompt for LLaMA
    if (pineconeContext) {
      const enhancedMessages = [
        ...messages,
        {
          role: 'system',
          content: `Context: ${pineconeContext.map(context => `${context.name} from ${context.school} in the ${context.department} department. Rating: ${context.rating}, Difficulty: ${context.difficulty}, Would take again: ${context.would_take_again}%`).join(' ')}`,
        }
      ];

      console.log('Enhanced Messages for LLaMA:', enhancedMessages);

      // Query LLaMA to generate a response based on the enhanced context
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama3-8b-8192',
        messages: enhancedMessages,
        temperature: 1.5,
        max_tokens: 1024,
        top_p: 1,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
      });

      return response.data;
    } else {
      console.warn('🟡 No context found in Pinecone. Using LLaMA without additional context.');
      
      // Query LLaMA without additional context
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama3-8b-8192',
        messages,
        temperature: 1.5,
        max_tokens: 1024,
        top_p: 1,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
      });

      return response.data;
    }
  } catch (error) {
    console.error('🔴 Error querying LLaMA API with RAG:', error.message);
    throw new Error('Failed to query LLaMA API with RAG');
  }
};
