import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.TEST_CASE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, numberOfTestCases } = await req.json();

    const extractedText = context
      .map((item: any) => item.text.trim()) // get only text field and trim
      .join("\n\n"); // join with line breaks between items

    const fullPrompt = `You are an expert test case generator.

Based on the given user prompt and the related context from a document, generate *exactly ${numberOfTestCases} test cases* in *valid JSON* format. Follow this strict format exactly:

[
  {
    "testcaseID": "TC-001",
    "description": "Brief description of what is being tested.",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "expectedResults": "Expected outcome of the test.",
    "priority": "High/Medium/Low"
  }
]

⚠ Strict Rules:
- Return exactly ${numberOfTestCases} test cases.
- Only return a valid JSON array.
- Do NOT include any explanations, markdown, or comments.
- Use meaningful and unique test case IDs like TC-001, TC-002, etc.
- Ensure all test cases are relevant to the prompt and context.

---

User Prompt:
${prompt}

---

Context:
${extractedText}`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ testcases: text });
  } catch (error) {
    console.error("Error generating test cases:", error);
    return NextResponse.json(
      { error: "Failed to generate test cases", detail: String(error) },
      { status: 500 }
    );
  }
}
