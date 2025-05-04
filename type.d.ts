// Define the TestCase type
type TestCase = {
  testcaseID: string;
  description: string;
  steps: string[];
  expectedResults: string;
  priority: "High" | "Medium" | "Low";
};

type TestcaseGroup = {
  heading: string;
  testcases: TestCase[];
};
