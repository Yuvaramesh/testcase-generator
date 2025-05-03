"use client";

import type React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from "@ai-sdk/react";
import { Download, Loader2 } from "lucide-react";
import { downloadTestCases } from "@/lib/action";
import TestCaseTable from "./test-case-table";
import axios from "axios";
import { toast } from "./ui/use-toast";

export default function TestCaseGenerator() {
  const [heading, setHeading] = useState("");
  const [files, setFiles] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [testCases, setTestCases] = useState([]);
  const [status, setStatus] = useState("Upload and process the document");
  const [isUploaded, setIsUploaded] = useState(false);

  const { messages, append, isLoading, setMessages } = useChat({
    api: "/api/chat",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files?.[0] || null);
    }
  };
  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    formData.append("file", files);

    setStatus("Uploading and processing...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setStatus("Document uploaded successfully!");
        toast({
          title: "Success",
          description: "Document uploaded and processed successfully.",
          variant: "default",
        });
        setIsUploaded(true);
      } else {
        setStatus("Failed to upload document.");
        toast({
          title: "Error",
          description: result.message || "Failed to upload the document.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload the document.",
        variant: "destructive",
      });
    }
    setStatus("Document uploaded successfully!");
  };
  async function fetchRelevantData() {
    try {
      // Construct the request body
      const requestBody = { prompt: heading };

      // Send POST request to the server
      const response = await axios.post("/api/query", requestBody);

      // Check if the response is successful
      if (response.status === 200) {
        console.log("Results:", response.data.results);
        return response.data.results;
      } else {
        console.error("Error:", response.data.error || "Unknown error");
        return null;
      }
    } catch (error) {
      console.error("Error making API call:", error);
      return null;
    }
  }

  const handleReset = () => {
    setHeading("");
    setFiles(null);
    setMessages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateTextCase = async () => {
    setIsGenerating(true);
    setStatus("Generating test cases...");
    fetchRelevantData().then(async (data) => {
      console.log(data);

      if (data) {
        const testcase = await axios.post("/api/generate-testcase", {
          context: data,
          prompt: heading,
        });
        const testcases = JSON.parse(
          testcase.data.testcases.replace(/```json/g, "").replace(/```/g, "")
        );

        setTestCases(testcases);
      } else {
        toast({
          title: "Error",
          description: "No relevant data found for the given prompt.",
          variant: "destructive",
        });
      }
    });
    setIsGenerating(false);
    setStatus("Test cases generated successfully!");
  };

  const handleDownloadExcel = () => {
    setIsDownloading(true);
    const data = testCases.map((test: TestCase) => ({
      "Test Case ID": test.testcaseID,
      Description: test.description,
      Steps: test.steps.join(" → "),
      "Expected Result": test.expectedResults,
      Priority: test.priority,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Cases");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "test_cases_output.xlsx");
    setIsDownloading(false);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="heading">Test Case Heading</Label>
              <Input
                id="heading"
                max={10}
                placeholder="Enter the heading for test cases"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="document"
                className="text-base font-semibold text-gray-700"
              >
                Upload Document (PDF/Word)
              </Label>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 border border-gray-300 rounded-xl p-4 bg-white shadow-sm">
                <Input
                  id="document"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                  className="w-full sm:flex-1 file:bg-primary file:text-white file:border-none file:px-4 file:rounded-lg file:cursor-pointer"
                />

                <Button
                  type="button"
                  disabled={isGenerating || isLoading}
                  onClick={handleUpload}
                  className="w-full sm:w-auto"
                >
                  {(isGenerating || isLoading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Upload
                </Button>
              </div>

              <p className="text-sm text-muted-foreground italic">
                Supported formats: PDF, DOC, DOCX (Max size: 5MB)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={
                  isGenerating ||
                  isLoading ||
                  !isUploaded ||
                  !!!heading ||
                  !files
                }
                className="flex-1"
                onClick={generateTextCase}
              >
                {(isGenerating || isLoading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Test Cases
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleDownloadExcel}
                disabled={testCases.length === 0 || isDownloading}
                className="flex-1"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Generated Test Cases</h2>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50">
                  <p className="font-medium mb-2">
                    {message.role === "user" ? "You:" : "AI:"}
                  </p>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.experimental_attachments?.map((attachment, i) => (
                    <div key={i} className="mt-2">
                      {attachment.contentType === "application/pdf" && (
                        <iframe
                          src={attachment.url}
                          width="100%"
                          height="500"
                          title={`Attachment ${i}`}
                          className="border rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <TestCaseTable initialTestCases={testCases} />
    </div>
  );
}
