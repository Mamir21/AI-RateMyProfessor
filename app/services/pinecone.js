import dotev from 'dotenv';
dotev.config();

import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from './embedding.js';

function createPineconeClient() {
  const apiKey = process.env.NEXT_PUBLIC_PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error('Pinecone API key is missing');
  }
  return new Pinecone({ apiKey });
}

const indexName = 'ratemyprofessor';
const pc = createPineconeClient();
const index = pc.index(indexName);

export async function queryProfessorData(embedding) {
  try {
    const queryResponse = await index.query({
      topK: 1,
      vector: embedding,
      includeMetadata: true,
    });

    if (queryResponse.matches.length > 0) {
      return queryResponse.matches[0].metadata;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
}

export async function searchProfessors(professorName, university, limit = 1) {
  try {
    const filter = {};
    if (professorName) filter.name = { $eq: professorName };
    if (university) filter.school = { $eq: university };

    const queryOptions = {
      topK: limit,
      includeMetadata: true,
    };

    // Only add the filter if it's not empty
    if (Object.keys(filter).length > 0) {
      queryOptions.filter = filter;
    }

    const queryResponse = await index.query(queryOptions);

    return queryResponse.matches.map(match => match.metadata);
  } catch (error) {
    console.error('Error searching professors in Pinecone:', error);
    throw error;
  }
}

export async function storeProfessorData(professorData) {
  try {
    const embedding = generateEmbedding(`${professorData.name} ${professorData.school}`);
    await index.upsert([
      {
        id: `professor_${professorData.name}_${professorData.school}`,
        values: embedding,
        metadata: professorData,
      }
    ]);
    console.log('Data successfully upserted to Pinecone');
  } catch (error) {
    console.error('Error storing professor data in Pinecone:', error);
    throw error;
  }
}