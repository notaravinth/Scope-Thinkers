import "dotenv/config";
import { createHash } from "node:crypto";

import { fetchRemoteJobs } from "./src/services/jobicy.js";
import { generateEmbeddings } from "./src/services/embeddings.js";
import {
  ensureJobCollection,
  closeWeaviate,
} from "./src/services/weaviate.js";

const BATCH_SIZE = 5;
const MAX_RETRIES = 5;

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

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error) {
  const message = String(error?.message || error);

  return (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("rate limit")
  );
}

async function generateEmbeddingsWithRetry(texts) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await generateEmbeddings(texts, "RETRIEVAL_DOCUMENT");
    } catch (error) {
      if (!isRateLimitError(error) || attempt >= MAX_RETRIES) {
        throw error;
      }

      const delay = Math.min(2000 * 2 ** attempt, 60000);

      console.warn(
        `Gemini rate limit reached. Retrying in ${delay / 1000}s...`
      );

      await wait(delay);
    }
  }
}

function createEmbeddingText(job) {
  return [
    `Title: ${job.title}`,
    `Company: ${job.company}`,
    `Description: ${job.description}`,
    `Skills and industry: ${job.skills.join(", ")}`,
    `Location: ${job.location}`,
    `Experience: ${job.experienceLevel}`,
  ].join("\n");
}

async function syncJobs() {
  let inserted = 0;
  let skipped = 0;

  try {
    const jobs = await fetchRemoteJobs();
    const collection = await ensureJobCollection();

    console.log(`Fetched ${jobs.length} real jobs from Jobicy`);

    const pendingJobs = [];

    // Check existing IDs first, so we don't spend embedding requests
    // on jobs that have already been saved.
    for (const job of jobs) {
      const id = stableUuid(job.sourceId);
      const exists = await collection.data.exists(id);

      if (exists) {
        skipped++;
        continue;
      }

      pendingJobs.push({ job, id });
    }

    console.log(`Already stored: ${skipped}`);
    console.log(`New jobs to process: ${pendingJobs.length}`);

    for (
      let start = 0;
      start < pendingJobs.length;
      start += BATCH_SIZE
    ) {
      const batch = pendingJobs.slice(start, start + BATCH_SIZE);

      const embeddingTexts = batch.map(({ job }) =>
        createEmbeddingText(job)
      );

      // One Gemini request for this batch.
      const embeddings = await generateEmbeddingsWithRetry(
        embeddingTexts
      );

      // Store the resulting vectors in Weaviate.
      for (let i = 0; i < batch.length; i++) {
        const { job, id } = batch[i];

        const properties = {
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

        await collection.data.insert({
          id,
          properties,
          vectors: embeddings[i],
        });

        inserted++;
        console.log(`Inserted: ${job.title}`);
      }

      console.log(
        `Processed ${Math.min(
          start + batch.length,
          pendingJobs.length
        )}/${pendingJobs.length} new jobs`
      );
    }

    console.log("\nJobicy sync completed.");
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped existing: ${skipped}`);
  } catch (error) {
    console.error("Jobicy sync failed:", error.message);
    process.exitCode = 1;
  } finally {
    await closeWeaviate();
  }
}

await syncJobs();