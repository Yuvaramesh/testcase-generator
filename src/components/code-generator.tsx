"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2 } from "lucide-react";
import { downloadCodeZip } from "@/lib/action";

export default function CodeGenerator() {
  const [testCases, setTestCases] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTestCases(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testCases) {
      alert("Please upload a test case Excel file");
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate code generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setGeneratedCode(`
// Generated Test Code
import org.junit.Test;
import static org.junit.Assert.*;

public class UserAuthenticationTest {
    
    @Test
    public void testValidLogin() {
        UserService service = new UserService();
        assertTrue(service.login("validUser", "validPassword"));
    }
    
    @Test
    public void testInvalidPassword() {
        UserService service = new UserService();
        assertFalse(service.login("validUser", "invalidPassword"));
    }
    
    @Test
    public void testNonExistentUser() {
        UserService service = new UserService();
        assertFalse(service.login("nonExistentUser", "anyPassword"));
    }
}
      `);
    } catch (error) {
      console.error("Error generating code:", error);
      alert("An error occurred while generating code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedCode) {
      alert("No code to download");
      return;
    }

    setIsDownloading(true);

    try {
      await downloadCodeZip(generatedCode);
    } catch (error) {
      console.error("Error downloading code:", error);
      alert("An error occurred while downloading code");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setTestCases(null);
    setGeneratedCode("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="testcases">Upload Test Cases</Label>
              <Input
                id="testcases"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                required
              />
              <p className="text-sm text-gray-500">
                Upload an Excel file containing test cases
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={isGenerating} className="flex-1">
                {isGenerating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Code
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
                onClick={handleDownload}
                disabled={!generatedCode || isDownloading}
                className="flex-1"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download ZIP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {generatedCode && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Generated Code</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {generatedCode}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
