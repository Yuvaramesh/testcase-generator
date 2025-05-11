# 🧪 Test Case Generator & Code Generation Platform

This is a powerful AI-driven platform to generate test cases and test automation code from uploaded documents or prompts. Built using **Next.js**, **Vector Databases (Qdrant)**, and **LLMs (Gemini, DeepSeek, etc.)**, this tool simplifies the testing process for QA engineers and developers.

## 🚀 Features

* 🔍 Upload documents (e.g., Requirement Specs, Test Plans)
* 🧠 Extract and chunk content with vector embeddings
* 💬 Chat interface powered by LLM for context-aware test case generation
* ⚙️ Generate code snippets for testing frameworks (Selenium, Playwright, Cypress)
* 🌐 Supports multiple languages (Python, Java, JS, etc.)
* 🎛️ Sidebar to choose framework, tool, and language preferences
* 💾 Save and download generated test cases

## 🖼️ UI Preview

> *Add a screenshot or GIF here showing the file upload and chat interface.*

## 🛠️ Tech Stack

* **Frontend**: Next.js (App Router), Tailwind CSS, TypeScript
* **LLMs**: Gemini API, DeepSeek via Hugging Face
* **Vector DB**: Qdrant
* **Embeddings**: `sentence-transformers` or `openai-embeddings`
* **Backend API**: Node.js / Python integration for file processing and LLM calls

## 📦 Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000)

## 📁 Folder Structure

```
/app
  /api             --> API routes for chat, file upload
  /components      --> UI components (Sidebar, ChatBox, FileUploader)
  /lib             --> Utility functions (vector DB interaction, chunking)
  /types           --> TypeScript types
/public
```

## ✨ How It Works

1. **Upload Document** – File is parsed and split into semantic chunks.
2. **Embed & Store** – Chunks are embedded and stored in Qdrant.
3. **Chat with Context** – Prompt the chatbot to generate test cases using context from the uploaded file.
4. **Generate Code** – Based on selected framework/tool/language, auto-generate test scripts.

## 📄 Example Use Cases

* Generate Playwright scripts from uploaded test plans
* Get BDD-style test cases from requirement docs
* Translate manual test steps into automation code
* Export test scripts for Selenium in Python or Java

## 🧠 LLM Configuration

You can easily switch between LLMs:

```ts
const model = process.env.LLM_PROVIDER === "gemini" ? GeminiClient : DeepSeekClient;
```

Update `.env.local`:

```
LLM_PROVIDER=gemini
HUGGINGFACE_API_KEY=your_key
GEMINI_API_KEY=your_key
```

## 📤 Deploy on Vercel

Deploy your Next.js project to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📚 Resources

* [Next.js Documentation](https://nextjs.org/docs)
* [Qdrant Docs](https://qdrant.tech/documentation/)
* [Gemini API](https://ai.google.dev/)
* [Hugging Face Inference API](https://huggingface.co/docs/api-inference)

## 🧑‍💻 Author

**Yuva Sri**
[Portfolio](https://yuva-sri-ramesh-portfolio.vercel.app) • [LinkedIn](https://www.linkedin.com/in/yuva-sri-ramesh/) • [GitHub](https://github.com/Yuva-Sri-Ramesh)

## Demo - (On Going)

**Do Check it out** - https://xeno-test.vercel.app/
