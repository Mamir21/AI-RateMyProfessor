export function generateEmbedding(text, dimensions = 384) {
  const words = text.toLowerCase().split(/\W+/);
  const embedding = new Array(dimensions).fill(0);

  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    const hash = hashString(word);
    for (let i = 0; i < dimensions; i++) {
      embedding[i] += Math.sin(hash * (i + 1));
    }
  }

  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}