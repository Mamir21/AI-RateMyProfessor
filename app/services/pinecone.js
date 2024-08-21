import { PineconeClient } from '@pinecone-database/pinecone';
import axios from 'axios';


let pineconeClient = null;

export const initPinecone = async () => {
  try {
    // Initialize Pinecone client
    pineconeClient = new PineconeClient();

    await pineconeClient.init({
      apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY,
      environment: process.env.NEXT_PUBLIC_PINECONE_ENVIRONMENT,
    });

    console.log('🟢 Pinecone client initialized successfully.');
  } catch (error) {
    console.error('🔴 Error initializing Pinecone client:', error.message);
    throw new Error('Pinecone initialization failed');
  }
};

export const storeProfessorData = async (professorData, embedding) => {
  try {
    if (!pineconeClient) {
      await initPinecone();
    }

    const index = pineconeClient.Index(process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME);

    const upsertRequest = {
      vectors: [
        {
          id: professorData.id,
          values: embedding,
          metadata: professorData,
        },
      ],
    };

    await index.upsert({ upsertRequest });

    console.log(`🟢 Successfully stored data for Professor ${professorData.name} in Pinecone.`);
  } catch (error) {
    console.error('🔴 Error storing professor data in Pinecone:', error.message);
    throw new Error('Failed to store professor data');
  }
};

export const queryProfessorData = async (query) => {
  try {
    if (!pineconeClient) {
      await initPinecone();
    }

    const index = pineconeClient.Index(process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME);

    // Fetch embedding for the query from the API route
    const { embedding: queryEmbedding } = await axios.get('/api/fetchProfessorData', {
      params: {
        schoolName: query.schoolName,
        professorName: query.professorName,
      },
    }).then((response) => response.data);

    // Query Pinecone
    const queryRequest = {
      vector: queryEmbedding,
      topK: 1,
      includeMetadata: true,
    };

    const response = await index.query({ queryRequest });

    if (response.matches && response.matches.length > 0) {
      console.log('🟢 Found matching professor data in Pinecone.');
      return response.matches[0].metadata;
    } else {
      console.log('🟡 No matching data found in Pinecone. Fetching from external source...');

      // Fetch data and embedding from the API route
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
        console.error('🔴 Failed to fetch professor data from external source.');
        return null;
      }
    }
  } catch (error) {
    console.error('🔴 Error querying professor data from Pinecone:', error.message);
    throw new Error('Failed to query professor data');
  }
};