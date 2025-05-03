import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextRequest, NextResponse } from "next/server";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GOOGLE_API_KEY || "YOUR_API_KEY_HERE", // move to .env
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.VECTOR_CLOUND_API_URL,
  apiKey: process.env.VECTOR_CLOUND_API_KEY,
  collectionName: "testcase-generation",
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer]);

    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const allSplits = await splitter.splitDocuments(docs);

    // Assign file metadata to all chunks
    const fileId = crypto.randomUUID();
    const fileName = file.name;

    const docsWithMetadata = allSplits.map((doc) => {
      doc.metadata = {
        ...doc.metadata,
        id: fileId,
        name: fileName,
      };
      return doc;
    });

    // Clear existing documents
    await vectorStore.delete({ filter: {} });

    // Add new document chunks to vector store
    await vectorStore.addDocuments(docsWithMetadata);

    return NextResponse.json({
      message: "PDF loaded and embedded successfully",
      file: {
        id: fileId,
        name: fileName,
      },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { message: "Error processing PDF file", error: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch the most recent embedded document (if any)
    const results = await vectorStore.similaritySearch(
      "Tester authentication",
      1
    ); // dummy query
    if (!results || results.length === 0) {
      return NextResponse.json({ file: null }, { status: 200 });
    }

    const doc = results[0];

    return NextResponse.json({
      file: {
        id: doc.metadata?.id || "N/A",
        name: doc.metadata?.name || "Unnamed File",
      },
    });
  } catch (error) {
    console.error("Error fetching file info:", error);
    return NextResponse.json(
      { message: "Error retrieving document info", error },
      { status: 500 }
    );
  }
}
