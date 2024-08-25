import axios from 'axios';
import { queryProfessorData, searchProfessors } from './pinecone';
import { generateEmbedding } from './embedding';

const LlamaAPIEndpoint = "https://api.groq.com/openai/v1/chat/completions";
const LlamaAPIKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

export const generateResponseWithRAG = async (messages) => {
  try {
    const userMessage = messages[messages.length - 1];
    if (userMessage.role !== 'user') throw new Error('Last message is not from user');

    const queryText = userMessage.content.trim();
    const embedding = generateEmbedding(queryText);

    if (!embedding) throw new Error('Failed to generate embedding');

    const intent = determineQueryIntent(queryText);
    let response;

    switch (intent) {
      case 'SPECIFIC_PROFESSOR':
        response = await handleSpecificProfessorQuery(queryText, embedding);
        break;
      case 'BEST_PROFESSORS':
        response = await handleBestProfessorsQuery(queryText, embedding);
        break;
      case 'COMPARE_PROFESSORS':
        response = await handleCompareProfessorsQuery(queryText, embedding);
        break;
      default:
        response = await generateLlamaResponse(messages);
        break;
    }

    return response;

  } catch (error) {
    console.error('Error in generateResponseWithRAG:', error);
    return {
      choices: [{
        message: { content: `An error occurred: ${error.message}. Please try again or ask a different question.` }
      }]
    }
  }
}

const generateLlamaResponse = async (messages) => {
  try {
    const response = await axios.post(LlamaAPIEndpoint, {
      model: "llama3-8b-8192",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1
    }, {
      headers: { "Authorization": `Bearer ${LlamaAPIKey}`, "Content-Type": "application/json" }
    })

    const responseData = response.data;
    if (responseData.choices && responseData.choices[0].message) {
      return { choices: [{ message: responseData.choices[0].message }] };
    } else {
      throw new Error('Unexpected LLaMA response structure');
    }
  } catch (error) {
    console.error('Error generating LLaMA response:', error);
    return {
      choices: [{
        message: { content: `Failed to generate response using LLaMA. Please try again.` }
      }]
    }
  }
}

const handleSpecificProfessorQuery = async (queryText, embedding) => {
  const { university, professor } = parseUniversityAndProfessor(queryText);
  
  try {
    let searchResults = [];
    if (professor || university) {
      searchResults = await searchProfessors(professor, university);
    }
    
    if (searchResults.length > 0) {
      const professorData = searchResults[0];
      return generateResponseWithProfessorData(queryText, professorData);
    } else {
      const professorData = await queryProfessorData(embedding);
      if (professorData) {
        return generateResponseWithProfessorData(queryText, professorData);
      } else {
        return generateLlamaResponse([{ role: 'user', content: queryText }]);
      }
    }
  } catch (error) {
    console.error('Error in handleSpecificProfessorQuery:', error);
    return generateLlamaResponse([{ role: 'user', content: queryText }]);
  }
}

const generateResponseWithProfessorData = (queryText, professorData) => {
  const context = `Professor ${professorData.name} teaches at ${professorData.school}. Their rating is ${professorData.rating}/5, with a difficulty level of ${professorData.difficulty}/5. ${professorData.would_take_again}% of students would take their class again.`;
  
  return generateLlamaResponse([
    { role: 'system', content: `You are an AI assistant with knowledge about professors. Use the following information to answer the user's question: ${context}` },
    { role: 'user', content: queryText }
  ])
}

const handleBestProfessorsQuery = async (queryText, embedding) => {
  const university = extractUniversity(queryText);
  const topProfessors = await searchProfessors('', university, 5);

  if (topProfessors.length === 0) {
    return generateLlamaResponse([{ role: 'user', content: queryText }]);
  }

  const professorList = topProfessors.map((prof, index) => 
    `${index + 1}. ${prof.name}: Rating ${prof.rating}/5, Difficulty ${prof.difficulty}/5`
  ).join('\n');

  const context = `Here are the top professors at ${university}:\n${professorList}`;

  return generateLlamaResponse([
    { role: 'system', content: `You are an AI assistant with knowledge about professors. Use the following information to answer the user's question: ${context}` },
    { role: 'user', content: queryText }
  ])
}

const handleCompareProfessorsQuery = async (queryText, embedding) => {
  const professors = extractProfessors(queryText);
  const university = extractUniversity(queryText);

  const professorData = await Promise.all(
    professors.map(prof => searchProfessors(prof, university, 1).then(results => results[0]))
  )

  const validProfessors = professorData.filter(Boolean);

  if (validProfessors.length < 2) {
    return generateLlamaResponse([{ role: 'user', content: queryText }]);
  }

  const comparisonText = validProfessors.map(prof => 
    `${prof.name}: Rating ${prof.rating}/5, Difficulty ${prof.difficulty}/5, Would take again: ${prof.would_take_again}%`
  ).join('\n');

  const context = `Comparison of professors at ${university}:\n${comparisonText}`;

  return generateLlamaResponse([
    { role: 'system', content: `You are an AI assistant with knowledge about professors. Use the following information to answer the user's question: ${context}` },
    { role: 'user', content: queryText }
  ])
}

const determineQueryIntent = (queryText) => {
  if (queryText.toLowerCase().includes('best professors')) return 'BEST_PROFESSORS';
  if (queryText.toLowerCase().includes('compare')) return 'COMPARE_PROFESSORS';
  return 'SPECIFIC_PROFESSOR';
}

const parseUniversityAndProfessor = (queryText) => {
  const words = queryText.split(' ');
  const professorIndex = words.findIndex(word => word.toLowerCase() === 'professor');
  const atIndex = words.findIndex(word => word.toLowerCase() === 'at');

  if (professorIndex !== -1 && atIndex !== -1 && atIndex > professorIndex) {
    const professor = words.slice(professorIndex + 1, atIndex).join(' ');
    const university = words.slice(atIndex + 1).join(' ');
    return { university, professor };
  }

  return { university: "", professor: "" };
}

const extractUniversity = (queryText) => {
  const atIndex = queryText.toLowerCase().indexOf(' at ');
  return atIndex !== -1 ? queryText.slice(atIndex + 4) : "";
}

const extractProfessors = (queryText) => {
  const matches = queryText.match(/Professor \w+/g);
  return matches ? matches.map(match => match.replace('Professor ', '')) : [];
}

const formatProfessorResponse = (professorData) => {
  return {
    choices: [{
      message: {
        content: `Professor ${professorData.name} at ${professorData.school} has a rating of ${professorData.rating}/5. 
        The difficulty level is ${professorData.difficulty}/5, and ${professorData.would_take_again}% of students would take their class again. 
        What else would you like to know about this professor?`
      }
    }]
  }
}

export const handleUserProvidedData = async (professorData) => {
  try {
    await storeProfessorData(professorData);
    return {
      choices: [{
        message: {
          content: `Thank you! The data for Professor ${professorData.name} at ${professorData.school} has been saved.`
        }
      }]
    };
  } catch (error) {
    console.error('Error saving professor data:', error);
    return {
      choices: [{
        message: {
          content: `Failed to save the data. Please try again.`
        }
      }]
    }
  }
}