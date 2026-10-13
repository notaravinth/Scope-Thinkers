
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { sampleJobs } from "./src/data/jobs.js";
import { generateEmbedding } from "./src/services/embeddings.js";
import { ensureJobCollection, closeWeaviate } from "./src/services/weaviate.js";

async function seedJobs() {
  try {
    const collection = await ensureJobCollection();

    for (const job of sampleJobs) {
      const text = [
        job.title,
        job.description,
        `Skills: ${job.skills.join(", ")}`,
        `Experience: ${job.experienceLevel}`,
      ].join("\n");

      const vector = await generateEmbedding(text, "RETRIEVAL_DOCUMENT");

      await collection.data.insert({
        id: randomUUID(),
        properties: {
          title: job.title,
          company: job.company,
          description: job.description,
          skills: job.skills,
          location: job.location,
          experienceLevel: job.experienceLevel,
          employmentType: job.employmentType,
        },
        vectors: vector,
      });

      console.log(`Seeded: ${job.title} at ${job.company}`);
    }

    console.log(`Finished seeding ${sampleJobs.length} jobs.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await closeWeaviate();
  }
}

await seedJobs();
