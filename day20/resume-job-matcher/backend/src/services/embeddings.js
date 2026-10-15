const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://localhost:11434";

const MODEL = "embeddinggemma-2:270m";
const DIMENSIONS = 768;

function prepareInput(text, taskType) {
  if (taskType === "RETRIEVAL_QUERY") {
    return `task: search result | query: ${text.trim()}`;
  }

  return `title: none | text: ${text.trim()}`;
}

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
    texts.some(
      (text) => typeof text !== "string" || !text.trim()
    )
  ) {
    throw new Error("Valid text inputs are required");
  }

  const input = texts.map((text) =>
    prepareInput(text, taskType)
  );

  let response;

  try {
    response = await fetch(`${OLLAMA_URL}/api/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input,
      }),
    });
  } catch (error) {
    throw new Error(
      `Could not connect to Ollama at ${OLLAMA_URL}. ` +
        `Make sure Ollama is running. Details: ${error.message}`
    );
  }

  if (!response.ok) {
    const details = await response.text();

    throw new Error(
      `Ollama embedding request failed (${response.status}): ${details}`
    );
  }

  const data = await response.json();
  const embeddings = data.embeddings;

  if (
    !Array.isArray(embeddings) ||
    embeddings.length !== texts.length ||
    embeddings.some(
      (embedding) =>
        !Array.isArray(embedding) ||
        embedding.length !== DIMENSIONS ||
        embedding.some(
          (value) => !Number.isFinite(value)
        )
    )
  ) {
    throw new Error(
      `Ollama returned invalid embeddings. Expected ${texts.length} vectors of ${DIMENSIONS} dimensions.`
    );
  }

  return embeddings;
}

export { DIMENSIONS };