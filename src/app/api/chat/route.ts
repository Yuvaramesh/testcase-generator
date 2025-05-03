import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Check if any message has PDF attachments
  interface Attachment {
    contentType: string;
  }

  interface Message {
    experimental_attachments?: Attachment[];
  }

  const hasPdfAttachments = (messages as Message[]).some((message) =>
    message.experimental_attachments?.some(
      (attachment) => attachment.contentType === "application/pdf"
    )
  );

  // Use Claude model for PDF processing
  const result = streamText({
    model: anthropic("claude-3-5-sonnet-latest"),
    messages,
    temperature: 0.7,
    system: `You are a test case generation assistant. 
    When provided with a document and a heading, analyze the document and generate comprehensive test cases.
    Format your response as a structured list of test cases with:
    - Test Case ID
    - Description
    - Preconditions
    - Steps to Execute
    - Expected Results
    - Priority (High/Medium/Low)
    
    Make your test cases detailed, specific, and actionable.`,
  });

  return result.toDataStreamResponse();
}
