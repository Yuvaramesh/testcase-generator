// Define the TestCase type
type TestCase = {
  testcaseID: string;
  description: string;
  steps: string[];
  expectedResults: string;
  priority: "High" | "Medium" | "Low";
};
