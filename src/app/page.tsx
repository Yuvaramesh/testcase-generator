import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestCaseGenerator from "@/components/test-case-generator";
import CodeGenerator from "@/components/code-generator";

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Test Case & Code Generator
      </h1>

      <Tabs defaultValue="test-cases" className="w-full py-4">
        <TabsList className="grid w-11/12 py-8    place-content-center grid-cols-2 mb-8">
          <TabsTrigger className=" py-3" value="test-cases">
            Test Case Generator
          </TabsTrigger>
          <TabsTrigger className="py-3" value="code-generator">
            Code Generator
          </TabsTrigger>
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
