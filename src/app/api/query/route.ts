import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextRequest, NextResponse } from "next/server";

// Initialize embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Initialize Qdrant vector store
const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.VECTOR_CLOUND_API_URL!,
  apiKey: process.env.VECTOR_CLOUND_API_KEY!,
  collectionName: "testcase-generation",
});

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request JSON body
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Both 'prompt' and 'fileId' are required" },
        { status: 400 }
      );
    }

    // Generate the vector for the prompt
    const vector = await embeddings.embedQuery(prompt);

    const results = await vectorStore.similaritySearchVectorWithScore(
      vector,
      3
    );

    // Format the results for the response
    const formattedResults = results.map(([doc, score], index) => ({
      index: index + 1,
      text: doc.pageContent,
      metadata: doc.metadata,
      score,
    }));

    return NextResponse.json({
      prompt,
      results: formattedResults,
    });
  } catch (error) {
    console.error("Error querying vector store with filter:", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}
