import { generateEmbedding } from "./embeddings.js";
import { ensureJobCollection } from "./weaviate.js";

export async function matchResume(resumeText, limit = 50) {
  if (!resumeText || typeof resumeText !== "string") {
    throw new Error("Resume text is required");
  }

  if (resumeText.trim().length < 30) {
    throw new Error(
      "Please provide more resume text to get meaningful matches",
    );
  }

  // Return between 1 and 50 jobs.
  const resultLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    50,
  );

  const collection = await ensureJobCollection();

  // Generate an embedding for the resume using Gemini.
  const resumeVector = await generateEmbedding(
    resumeText,
    "RETRIEVAL_QUERY",
  );

  // Search Weaviate for semantically similar jobs.
  const result = await collection.query.nearVector(
    resumeVector,
    {
      limit: resultLimit,
      returnMetadata: ["distance"],
    },
  );

  return result.objects.map((object) => {
    const distance = object.metadata?.distance;
    const properties = object.properties || {};

    return {
      sourceId: properties.sourceId,
      title: properties.title,
      company: properties.company,
      description: properties.description,
      skills: properties.skills || [],
      location: properties.location,
      experienceLevel: properties.experienceLevel,
      employmentType: properties.employmentType,
      url: properties.url,
      pubDate: properties.pubDate,
      salary: properties.salary,
      distance,
      similarity:
        typeof distance === "number"
          ? Math.max(
              0,
              Math.min(100, (1 - distance) * 100),
            )
          : null,
    };
  });
}