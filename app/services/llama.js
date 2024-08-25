import { queryProfessorData } from './pinecone';
import axios from 'axios';

export const generateResponseWithRAG = async (messages) => {
  try {
    const userMessage = messages.find(msg => msg.role === 'user');
    if (!userMessage) {
      throw new Error('No user message found');
    }

    const queryText = userMessage.content;

    // Step 1: Send the query text to the LLaMA model for parsing
    const parsingPrompt = `Imagine you are an information parser. The user will provide a sentence and you will identify the university name and professor name. If no university name is provided, set it to N/A. If no professor name is provided, set it to N/A. Return the output as a JSON in the format:
    university: UNIVERSITY_NAME,
    professor: PROFESSOR_NAME
    where UNIVERSITY_NAME is the parsed university name and PROFESSOR_NAME is the parsed professor name. If multiple universities or professors are given, choose the one that the user is asking the rating for.`;

    const parsingResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: parsingPrompt },
        { role: 'user', content: queryText }
      ],
      temperature: 0,
      max_tokens: 50,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
      },
    })

    // Log the entire response object
    console.log('Full API Response:', parsingResponse);

    // Extract the message content
    const messageContent = parsingResponse.data.choices[0].message.content;
    console.log('Message content:', messageContent); // Log out the raw message content

    // Extract the JSON part from the message content
    const jsonStartIndex = messageContent.indexOf('{');
    const jsonEndIndex = messageContent.lastIndexOf('}');
    let parsedData;

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      const jsonString = messageContent.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        parsedData = JSON.parse(jsonString);
        console.log('Parsed Data:', parsedData);
      } catch (error) {
        console.error('🔴 Failed to parse JSON from extracted content:', error.message);
        throw new Error('Invalid JSON in LLaMA response');
      }
    } else {
      console.error('🔴 Could not find valid JSON in the response');
      throw new Error('Invalid JSON in LLaMA response');
    }

    const { university, professor } = parsedData;

    // Step 2: Validate the parsed data
    if (university === 'N/A' || professor === 'N/A') {
      return {
        choices: [{
          message: {
            content: 'Please provide both the professor name and the school name.',
          }
        }]
      }
    }

    // Step 3: Query Pinecone or fetch from an external API if necessary
    const pineconeContext = await queryProfessorData({ schoolName: university, professorName: professor });
    
    let enhancedMessages = [...messages];
    if (pineconeContext) {
      enhancedMessages.push({
        role: 'system',
        content: `Context: Professor ${pineconeContext.name} from ${pineconeContext.school} in the ${pineconeContext.department} department. Rating: ${pineconeContext.rating}, Difficulty: ${pineconeContext.difficulty}, Would take again: ${pineconeContext.would_take_again}%`,
      })
    } else {
      enhancedMessages.push({
        role: 'system',
        content: `No specific information found for Professor ${professor} from ${university}. Please provide a general response based on the query.`,
      })
    }

    console.log('Enhanced Messages:', enhancedMessages);

    // Step 4: Generate a response using the LLaMA model
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
    }})

    // Log the entire response object to debug
    console.log('Full API Response:', response);

    // Extract and log the data
    console.log('API Response Data:', response.data);

    // Extract the content carefully
    if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return {
        choices: [{
          message: {
            content: response.data.choices[0].message.content
          }
        }]
      }
    } else {
      throw new Error('Unexpected response structure from LLaMA API');
    }
  } catch (error) {
    console.error('🔴 Error generating response:', error.message);
    return {
      choices: [{
        message: {
          content: `Error: ${error.message}`
        }
      }]
    }
  }
}