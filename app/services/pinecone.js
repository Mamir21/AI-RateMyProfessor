import { Pinecone } from '@pinecone-database/pinecone';
import axios from 'axios';

// Initialize Pinecone client using API key and index name from environment variables
const pineconeClient = new Pinecone({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY,
});

const index = pineconeClient.index(process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME);

console.log('🟢 Pinecone client and index initialized successfully.');

// Function to store professor data in Pinecone
export const storeProfessorData = async (professorData, embedding) => {
    try {
      const upsertRequest = {
        vectors: [
          {
            id: professorData.id,
            values: embedding,
            metadata: {
              name: professorData.name,
              department: professorData.department,
              school: professorData.school.name,
              rating: professorData.rating,
              difficulty: professorData.difficulty,
              num_ratings: professorData.num_ratings,
              would_take_again: professorData.would_take_again,
            },
          }
        ]
      };
  
      console.log('Upsert Request:', JSON.stringify(upsertRequest, null, 2));
      console.log('Type of professorData:', typeof professorData);
    console.log('Content of professorData:', professorData);
    console.log('Type of embedding:', typeof embedding);
    console.log('Content of embedding:', embedding);

  
      await index.upsert(upsertRequest);
      console.log(`🟢 Successfully stored data for Professor ${professorData.name} in Pinecone.`);
    } catch (error) {
      console.error('🔴 Error storing professor data in Pinecone:', error.message);
      throw new Error('Failed to store professor data');
    }
  };
  
  


// Function to query professor data from Pinecone, falling back to an external API if not found
export const queryProfessorData = async (query) => {
  try {
    // Step 1: Attempt to query Pinecone for the professor's data using a placeholder vector
    let pineconeResponse = await index.query({
      vector: Array(384).fill(0), // Placeholder vector, adjust to match your embedding model's output dimension
      topK: 1, // Return the top 1 match
      includeValues: true, // Include the embedding values in the response
      includeMetadata: true, // Include metadata in the response
      filter: {
        name: { $eq: query.professorName }, // Filter by professor name
        school: { $eq: query.schoolName }  // Filter by school name
      }
    });

    console.log('Query response from Pinecone:', pineconeResponse);

    // Step 2: If a match is found in Pinecone, return the metadata
    if (pineconeResponse.matches && pineconeResponse.matches.length > 0) {
      console.log('🟢 Found matching professor data in Pinecone.');
      return pineconeResponse.matches[0].metadata;
    } else {
      // Step 3: If no match is found, fetch data from the external API and store it in Pinecone
      console.warn('🟡 No matching data found in Pinecone, fetching from external API...');
      await fetchAndStoreProfessorData(query);

      // Step 4: After storing the data, query Pinecone again to retrieve the stored data
      pineconeResponse = await index.query({
        vector: Array(384).fill(0), // Placeholder vector, should match the size of the embedding
        topK: 1,
        includeValues: true,
        includeMetadata: true,
        filter: {
          name: { $eq: query.professorName }, // Filter by professor name
          school: { $eq: query.schoolName }  // Filter by school name
        }
      });

      // Step 5: If the data is now found, return the metadata
      if (pineconeResponse.matches && pineconeResponse.matches.length > 0) {
        console.log('🟢 Successfully retrieved the newly stored data from Pinecone.');
        return pineconeResponse.matches[0].metadata;
      } else {
        // If the data is still not found, throw an error
        throw new Error('Failed to retrieve the data from Pinecone after storing it.');
      }
    }
  } catch (error) {
    console.error('🔴 Error querying professor data from Pinecone:', error.message);
    throw error;
  }
};

// Function to fetch professor data from an external API and store it in Pinecone
const fetchAndStoreProfessorData = async (query) => {
  try {
    // Construct the full URL based on your environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/fetchProfessorData`;

    // Fetch data from the external API using the full URL
    const response = await axios.get(apiUrl, {
      params: {
        schoolName: query.schoolName,
        professorName: query.professorName,
      },
    });

    console.log('API Response:', response.data);

    // Check if the response content type is JSON
    if (response.headers['content-type'].includes('application/json')) {
      const { professorData, embedding } = response.data;

      // If valid data is returned, store it in Pinecone
      if (professorData && embedding) {
        await storeProfessorData(professorData, embedding);
      } else {
        console.error('🔴 Failed to fetch professor data from external API.');
        throw new Error('Failed to fetch and store professor data.');
      }
    } else {
      console.error('🔴 Unexpected response format:', response.data);
      throw new Error('Received non-JSON response from external API.');
    }
  } catch (error) {
    console.error('🔴 Error fetching professor data from external API:', error.message);
    throw error;
  }
};
