import { Pinecone } from '@pinecone-database/pinecone';
import axios from 'axios';

// Initialize Pinecone client and index directly
const pineconeClient = new Pinecone({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY,
});

const index = pineconeClient.Index(process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME);

console.log('🟢 Pinecone client and index initialized successfully.');

// Store professor data and embeddings in Pinecone
export const storeProfessorData = async (professorData, embedding) => {
  try {
    const upsertRequest = [
      {
        id: professorData.id,  // Unique ID for the professor
        values: embedding,     // Embedding vector for the professor
        metadata: {
          name: professorData.name,
          department: professorData.department,
          school: professorData.school.name,
          rating: professorData.rating,
          difficulty: professorData.difficulty,
          num_ratings: professorData.num_ratings,
          would_take_again: professorData.would_take_again,
        },
      },
    ];

    await index.upsert({ vectors: upsertRequest });

    console.log(`🟢 Successfully stored data for Professor ${professorData.name} in Pinecone.`);
  } catch (error) {
    console.error('🔴 Error storing professor data in Pinecone:', error.message);
    throw new Error('Failed to store professor data');
  }
};

// Query Pinecone for professor data based on input text
export const queryProfessorData = async (query) => {
    try {
      // Fetch embedding for the query (professor's name and school) from your Node.js API route
      const queryEmbedding = await axios.get('/api/fetchProfessorData', {
        params: {
          schoolName: query.schoolName,
          professorName: query.professorName,
        },
      }).then((response) => response.data.embedding);
  
      // Query Pinecone
      const response = await index.query({
        vector: queryEmbedding,
        topK: 1,
        includeValues: true,
        includeMetadata: true,
      });
  
      if (response.matches && response.matches.length > 0) {
        console.log('🟢 Found matching professor data in Pinecone.');
        return response.matches[0].metadata;
      } else {
        console.log('🟡 No matching data found in Pinecone. Fetching from external API...');
  
        // Fetch data from your external API if not found in Pinecone
        const { professorData, embedding } = await axios.get('/api/fetchProfessorData', {
          params: {
            schoolName: query.schoolName,
            professorName: query.professorName,
          },
        }).then((response) => response.data);
  
        if (professorData && embedding) {
          // Store the new data in Pinecone
          await storeProfessorData(professorData, embedding);
          return professorData;
        } else {
          console.error('🔴 Failed to fetch professor data from external API.');
          return null;
        }
      }
    } catch (error) {
      console.error('🔴 Error querying professor data from Pinecone:', error.message);
      throw new Error('Failed to query professor data');
    }
  };
  