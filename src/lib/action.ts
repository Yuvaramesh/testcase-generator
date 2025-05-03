"use server";

import * as XLSX from "xlsx";
import JSZip from "jszip";

export async function downloadTestCases(heading: string, testCases: string) {
  try {
    // Parse test cases from AI response
    const testCaseLines = testCases
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();

    // Convert test cases to worksheet data
    const wsData = [
      [
        "Test Case ID",
        "Description",
        "Preconditions",
        "Steps",
        "Expected Results",
        "Priority",
      ],
    ];

    let currentTestCase: string[] = ["", "", "", "", "", ""];
    let currentField = 0;

    for (const line of testCaseLines) {
      if (line.startsWith("Test Case ID:") || line.includes("Test Case ID:")) {
        if (currentTestCase[0] !== "") {
          wsData.push([...currentTestCase]);
          currentTestCase = ["", "", "", "", "", ""];
        }
        currentTestCase[0] = line.split("Test Case ID:")[1]?.trim() || "";
        currentField = 0;
      } else if (
        line.startsWith("Description:") ||
        line.includes("Description:")
      ) {
        currentTestCase[1] = line.split("Description:")[1]?.trim() || "";
        currentField = 1;
      } else if (
        line.startsWith("Preconditions:") ||
        line.includes("Preconditions:")
      ) {
        currentTestCase[2] = line.split("Preconditions:")[1]?.trim() || "";
        currentField = 2;
      } else if (
        line.startsWith("Steps") ||
        line.includes("Steps to Execute:")
      ) {
        currentTestCase[3] = line.split("Steps to Execute:")[1]?.trim() || "";
        currentField = 3;
      } else if (
        line.startsWith("Expected Results:") ||
        line.includes("Expected Results:")
      ) {
        currentTestCase[4] = line.split("Expected Results:")[1]?.trim() || "";
        currentField = 4;
      } else if (line.startsWith("Priority:") || line.includes("Priority:")) {
        currentTestCase[5] = line.split("Priority:")[1]?.trim() || "";
        currentField = 5;
      } else if (currentField >= 0 && currentField <= 5) {
        // Append to current field if it's a continuation
        currentTestCase[currentField] += " " + line.trim();
      }
    }

    // Add the last test case
    if (currentTestCase[0] !== "") {
      wsData.push([...currentTestCase]);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Test Cases");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Return the Excel file
    return excelBuffer;
  } catch (error) {
    console.error("Error creating Excel file:", error);
    throw new Error("Failed to create Excel file");
  }
}

export async function downloadCodeZip(code: string) {
  try {
    const zip = new JSZip();

    // Add code files to the zip
    zip.file("UserAuthenticationTest.java", code);

    // Add a README file
    zip.file(
      "README.md",
      `# Generated Test Code\n\nThis ZIP file contains automatically generated test code based on your test cases.`
    );

    // Generate the zip file
    const zipContent = await zip.generateAsync({ type: "arraybuffer" });

    // Return the zip file
    return zipContent;
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    throw new Error("Failed to create ZIP file");
  }
}
