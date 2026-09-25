// Cosine similarity with built-in normalization
export default function cosineSimilarity(a, b) 
{
  // L2 normalize both embeddings
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));

  const normalizedA = a.map(v => v / normA);
  const normalizedB = b.map(v => v / normB);

  // Compute dot product of normalized vectors
  let dot = 0;
  for (let i = 0; i < normalizedA.length; i++) {
    dot += normalizedA[i] * normalizedB[i];
  }

  return dot; // already cosine similarity
}