import { generateResponseWithRAG } from '@/app/services/llama';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const data = await generateResponseWithRAG(messages);

    if (!data || data.error) {
      console.error('🔴 Error in data:', data);
      throw new Error(data.error || 'Unknown error');
    }
    

    return new Response(JSON.stringify({ choices: [{ message: { content: data.response } }] }), { status: 200 });
  } catch (error) {
    console.error('🔴 Error handling request:', error.message);
    return new Response(JSON.stringify({ error: 'Error handling request' }), { status: 500 });
  }
}
