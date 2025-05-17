// pineconeClient.ts
// This file will initialize the Pinecone client.

import { Pinecone } from "@pinecone-database/pinecone";

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME || "deep-research-history";

let pinecone: Pinecone | null = null;

if (!pineconeApiKey) {
  console.warn(
    "Pinecone API Key is not defined. Please set PINECONE_API_KEY environment variable."
  );
}
if (!pineconeEnvironment) {
  console.warn(
    "Pinecone Environment is not defined. Please set PINECONE_ENVIRONMENT environment variable."
  );
}

if (pineconeApiKey && pineconeEnvironment) {
  pinecone = new Pinecone({
    apiKey: pineconeApiKey,
    environment: pineconeEnvironment,
  });
  console.log(
    `Pinecone client initialized for environment: ${pineconeEnvironment} and index: ${pineconeIndexName}`
  );
} else {
  console.error(
    "Failed to initialize Pinecone client due to missing API key or environment. Ensure PINECONE_API_KEY and PINECONE_ENVIRONMENT are set."
  );
}

export { pinecone, pineconeIndexName };
