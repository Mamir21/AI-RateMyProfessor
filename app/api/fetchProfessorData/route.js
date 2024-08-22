import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  try {
    const { schoolName, professorName } = req.query;

    // Resolve the path to the Python script
    const scriptPath = path.resolve('services/fetchProfessorData.py');

    const pythonProcess = spawn('python3', [scriptPath, schoolName, professorName]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0 || errorString) {
        console.error('🔴 Python script error:', errorString || `Exited with code ${code}`);
        return res.status(500).json({ error: `Python script error: ${errorString || `Exited with code ${code}`}` });
      }

      try {
        const result = JSON.parse(dataString);
        res.status(200).json(result);
      } catch (error) {
        console.error('🔴 Failed to parse JSON:', error);
        res.status(500).json({ error: 'Failed to parse JSON from Python script' });
      }
    });
  } catch (error) {
    console.error('🔴 Error executing Python script:', error);
    res.status(500).json({ error: 'Error fetching professor data' });
  }
}
