import { generateResponseWithRAG } from '@/app/services/llama';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const data = await generateResponseWithRAG(messages);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('🔴 Error handling request:', error);
    return new Response(JSON.stringify({ error: 'Error handling request' }), { status: 500 });
  }
}