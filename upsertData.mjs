import { storeProfessorData } from './app/services/pinecone.js';
import fs from 'fs/promises';
import path from 'path';

async function loadProfessorData() {
  const filePath = path.resolve('./app/data/professorData.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function upsertData() {
  try {
    const professorData = await loadProfessorData();
    for (const professor of professorData) {
      await storeProfessorData(professor);
    }
    console.log('Professor data upserted successfully.');
  } catch (error) {
    console.error('Error upserting professor data:', error);
  }
}

upsertData();