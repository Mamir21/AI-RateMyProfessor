import { spawn } from 'child_process';

export default async function handler(req, res) {
  try {
    const { schoolName, professorName } = req.query;

    const pythonProcess = spawn('python3', ['services/fetchProfessorData.py', schoolName, professorName]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('🔴 Python script error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: `Python script exited with code ${code}` });
      }

      try {
        const result = JSON.parse(dataString);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse JSON from Python script' });
      }
    });
  } catch (error) {
    console.error('🔴 Error executing Python script:', error);
    res.status(500).json({ error: 'Error fetching professor data' });
  }
}