import weaviate, { vectors, dataType } from "weaviate-client";

let client;

export async function connectWeaviate() {
  if (client) return client;

  const { WEAVIATE_URL, WEAVIATE_API_KEY } = process.env;

  if (!WEAVIATE_URL || !WEAVIATE_API_KEY) {
    throw new Error("Missing Weaviate credentials in backend/.env");
  }

  client = await weaviate.connectToWeaviateCloud(WEAVIATE_URL, {
    authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
  });

  if (!(await client.isReady())) {
    throw new Error("Weaviate cluster is not ready");
  }

  console.log("Connected to Weaviate Cloud");
  return client;
}

export async function ensureJobCollection() {
  const db = await connectWeaviate();
  const collectionName = "Job";

  // Reuse the existing collection rather than creating JobicyJob.
  const exists = await db.collections.exists(collectionName);

  if (!exists) {
    await db.collections.create({
      name: collectionName,
      vectorizers: vectors.selfProvided(),
      properties: [
        { name: "title", dataType: dataType.TEXT },
        { name: "company", dataType: dataType.TEXT },
        { name: "description", dataType: dataType.TEXT },
        { name: "skills", dataType: dataType.TEXT_ARRAY },
        { name: "location", dataType: dataType.TEXT },
        { name: "experienceLevel", dataType: dataType.TEXT },
        { name: "employmentType", dataType: dataType.TEXT },
        { name: "sourceId", dataType: dataType.TEXT },
        { name: "url", dataType: dataType.TEXT },
        { name: "pubDate", dataType: dataType.TEXT },
        { name: "salary", dataType: dataType.TEXT },
      ],
    });

    console.log("Created Weaviate Job collection");
  }

  const collection = db.collections.get(collectionName);

  // Add only properties that are missing from the existing schema.
  const config = await collection.config.get();
  const existingProperties = new Set(
    (config.properties || []).map((property) => property.name)
  );

  const additionalProperties = [
    { name: "sourceId", dataType: dataType.TEXT },
    { name: "url", dataType: dataType.TEXT },
    { name: "pubDate", dataType: dataType.TEXT },
    { name: "salary", dataType: dataType.TEXT },
  ];

  for (const property of additionalProperties) {
    if (!existingProperties.has(property.name)) {
      await collection.config.addProperty(property);
      console.log(`Added Job property: ${property.name}`);
    }
  }

  console.log("Using Weaviate Job collection");
  return collection;
}

export async function closeWeaviate() {
  if (client) {
    await client.close();
    client = undefined;
  }
}
