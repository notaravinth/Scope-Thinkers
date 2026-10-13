
import "dotenv/config";
import { generateEmbedding, DIMENSIONS } from "./src/services/embeddings.js";

try {
  const vector = await generateEmbedding(
    "Full-stack developer experienced in React, Node.js, REST APIs, and databases."
  );

  console.log("Gemini embedding works!");
  console.log("Vector dimensions:", vector.length);
  console.log("First five values:", vector.slice(0, 5));
} catch (error) {
  console.error("Embedding test failed:", error.message);
  process.exitCode = 1;
}
