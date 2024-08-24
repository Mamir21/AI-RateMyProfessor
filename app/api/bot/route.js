import { generateResponseWithRAG } from '../../services/llama.js';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const data = await generateResponseWithRAG(messages);

    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('🔴 Unexpected response structure:', data);
      throw new Error('Unexpected response structure');
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('🔴 Error handling request:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'Error handling request' }), { status: 500 });
  }
}
