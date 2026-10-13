import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in backend/.env");
}

const gemini = new GoogleGenAI({ apiKey });

const MODEL = "gemini-embedding-001";
const DIMENSIONS = 768;

export async function generateEmbedding(
  text,
  taskType = "RETRIEVAL_QUERY"
) {
  const embeddings = await generateEmbeddings([text], taskType);
  return embeddings[0];
}

export async function generateEmbeddings(
  texts,
  taskType = "RETRIEVAL_DOCUMENT"
) {
  if (
    !Array.isArray(texts) ||
    texts.length === 0 ||
    texts.some((text) => typeof text !== "string" || !text.trim())
  ) {
    throw new Error("Valid text inputs are required");
  }

  const response = await gemini.models.embedContent({
    model: MODEL,
    contents: texts.map((text) => text.trim()),
    config: {
      taskType,
      outputDimensionality: DIMENSIONS,
    },
  });

  const embeddings = response.embeddings?.map((item) => item.values);

  if (
    !embeddings ||
    embeddings.length !== texts.length ||
    embeddings.some(
      (embedding) =>
        !embedding || embedding.length !== DIMENSIONS
    )
  ) {
    throw new Error("Gemini returned invalid embeddings");
  }

  return embeddings;
}

export { DIMENSIONS };