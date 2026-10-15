import "dotenv/config";
import { createHash } from "node:crypto";

import { fetchRemoteJobs } from "./src/services/jobicy.js";
import { generateEmbeddings } from "./src/services/embeddings.js";
import {
  ensureJobCollection,
  closeWeaviate,
} from "./src/services/weaviate.js";

const BATCH_SIZE = 10;

function stableUuid(sourceId) {
  const hex = createHash("sha1")
    .update(`jobicy:${sourceId}`)
    .digest("hex")
    .slice(0, 32)
    .split("");

  hex[12] = "5";
  hex[16] = (
    (parseInt(hex[16], 16) & 0x3) | 0x8
  ).toString(16);

  const value = hex.join("");

  return [
    value.slice(0, 8),
    value.slice(8, 12),
    value.slice(12, 16),
    value.slice(16, 20),
    value.slice(20),
  ].join("-");
}

function createEmbeddingText(job) {
  return [
    `Company: ${job.company}`,
    `Description: ${job.description}`,
    `Skills and industry: ${job.skills.join(", ")}`,
    `Location: ${job.location}`,
    `Experience: ${job.experienceLevel}`,
    `Employment type: ${job.employmentType}`,
  ].join("\n");
}

function createProperties(job) {
  return {
    sourceId: job.sourceId,
    title: job.title,
    company: job.company,
    description: job.description,
    skills: job.skills,
    location: job.location,
    experienceLevel: job.experienceLevel,
    employmentType: job.employmentType,
    url: job.url,
    pubDate: job.pubDate,
    salary: job.salary,
  };
}

async function syncJobs() {
  let inserted = 0;
  let updated = 0;

  try {
    const jobs = await fetchRemoteJobs();
    const collection = await ensureJobCollection();

    console.log(`Fetched ${jobs.length} jobs from Jobicy`);
    console.log(
      "Generating new EmbeddingGemma 2 vectors for all fetched jobs..."
    );

    for (
      let start = 0;
      start < jobs.length;
      start += BATCH_SIZE
    ) {
      const batch = jobs.slice(start, start + BATCH_SIZE);

      const embeddingTexts = batch.map((job) =>
        [
          `Title: ${job.title}`,
          createEmbeddingText(job),
        ].join("\n")
      );

      // Generate fresh vectors with EmbeddingGemma 2.
      const embeddings = await generateEmbeddings(
        embeddingTexts,
        "RETRIEVAL_DOCUMENT"
      );

      for (let i = 0; i < batch.length; i++) {
        const job = batch[i];
        const id = stableUuid(job.sourceId);
        const properties = createProperties(job);
        const exists = await collection.data.exists(id);

        if (exists) {
          // Preserve the existing UUID and replace its old vector.
          await collection.data.update({
            id,
            properties,
            vectors: embeddings[i],
          });

          updated++;
          console.log(`Updated: ${job.title}`);
        } else {
          // Insert jobs that aren't in Weaviate yet.
          await collection.data.insert({
            id,
            properties,
            vectors: embeddings[i],
          });

          inserted++;
          console.log(`Inserted: ${job.title}`);
        }
      }

      console.log(
        `Processed ${Math.min(start + batch.length, jobs.length)}/${jobs.length}`
      );
    }

    console.log("\nEmbeddingGemma 2 migration completed.");
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Total processed: ${inserted + updated}`);
  } catch (error) {
    console.error("Job sync failed:", error.message);
    process.exitCode = 1;
  } finally {
    await closeWeaviate();
  }
}

await syncJobs();