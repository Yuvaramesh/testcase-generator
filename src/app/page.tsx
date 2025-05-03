import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestCaseGenerator from "@/components/test-case-generator";
import CodeGenerator from "@/components/code-generator";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Test Case & Code Generator
      </h1>

      <Tabs defaultValue="test-cases" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="test-cases">Test Case Generator</TabsTrigger>
          <TabsTrigger value="code-generator">Code Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="test-cases">
          <TestCaseGenerator />
        </TabsContent>

        <TabsContent value="code-generator">
          <CodeGenerator />
        </TabsContent>
      </Tabs>
    </main>
  );
}
