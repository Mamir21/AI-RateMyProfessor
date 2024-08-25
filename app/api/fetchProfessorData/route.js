import { spawn } from 'child_process';
import path from 'path';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolName = searchParams.get('schoolName');
    const professorName = searchParams.get('professorName');

    if (!schoolName || !professorName) {
      return new Response(JSON.stringify({ error: 'Missing required query parameters: schoolName, professorName' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Update the path to the correct location of fetchProfessorData.py
    const scriptPath = 'app/services/fetchProfessorData.py';

    console.log(`Running script: ${scriptPath} with args: ${schoolName}, ${professorName}`);

    const pythonProcess = spawn('python3', [scriptPath, schoolName, professorName]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    })

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    })

    const exitPromise = new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0 || errorString) {
          console.error('🔴 Python script error:', errorString || `Exited with code ${code}`);
          return reject(new Error(`Python script error: ${errorString || `Exited with code ${code}`}`));
        }
        resolve(dataString);
      })
    })

    const result = await exitPromise;

    try {
      const jsonResponse = JSON.parse(result);
      return new Response(JSON.stringify(jsonResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('🔴 Failed to parse JSON:', error, result);
      return new Response(JSON.stringify({ error: 'Failed to parse JSON from Python script' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('🔴 Error executing Python script:', error);
    return new Response(JSON.stringify({ error: 'Error fetching professor data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}