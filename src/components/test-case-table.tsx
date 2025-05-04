"use client";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Pencil,
  Save,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

// Priority badge color mapping
const priorityColors = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

export default function TestCaseTable({
  setTestCases,
  testCases,
}: {
  setTestCases: React.Dispatch<React.SetStateAction<TestcaseGroup[]>>;
  testCases: TestcaseGroup[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [editingIndex, setEditingIndex] = useState<[number, number] | null>(
    null
  );
  const [editForm, setEditForm] = useState<TestCase | null>(null);

  // Inside your component
  const sortedTestCases = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    // Process each heading group
    const grouped = testCases.map(({ heading, testcases }) => {
      // Filter
      const filtered = testcases.filter(
        (testCase) =>
          testCase.testcaseID.toLowerCase().includes(lowerSearch) ||
          testCase.description.toLowerCase().includes(lowerSearch) ||
          testCase.priority.toLowerCase().includes(lowerSearch)
      );

      // Sort
      if (sortConfig) {
        const key = sortConfig.key as keyof TestCase;
        filtered.sort((a, b) => {
          if (a[key] < b[key])
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (a[key] > b[key])
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        });
      }

      return {
        heading,
        values: filtered,
      };
    });

    return grouped.filter((group) => group.values.length > 0); // Exclude empty groups after filtering
  }, [testCases, searchTerm, sortConfig]);

  // Handle sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction icon
  const getSortDirectionIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // Start editing a test case
  const startEditing = (
    groupIndex: number,
    testIndex: number,
    testCase: TestCase
  ) => {
    setEditingIndex([groupIndex, testIndex]);
    setEditForm({ ...testCase, steps: [...testCase.steps] });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  // Handle form field changes
  const handleFormChange = (field: keyof TestCase, value: any) => {
    if (!editForm) return;

    if (field === "steps") {
      // Handle steps array specially
      setEditForm({
        ...editForm,
        steps: value.split("\n").filter((step: string) => step.trim() !== ""),
      });
    } else {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  // Save edited test case
  const saveTestCase = () => {
    if (!editForm || editingIndex === null) return;

    const [groupIndex, testIndex] = editingIndex;

    setTestCases((prev) =>
      prev.map((group, gIdx) =>
        gIdx === groupIndex
          ? {
              ...group,
              testcases: group.testcases.map((tc, tIdx) =>
                tIdx === testIndex ? editForm : tc
              ),
            }
          : group
      )
    );

    setEditingIndex(null);
    setEditForm(null);

    toast({
      title: "Test case updated",
      description: `Test case ${editForm.testcaseID} has been successfully updated.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          Generated Test Cases
          <Badge className="ml-2 bg-green-600">
            {" "}
            {testCases.reduce((acc, group) => acc + group.testcases.length, 0)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test cases generated based on the provided document and heading
        </CardDescription>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search test cases..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-[120px] cursor-pointer"
                  onClick={() => requestSort("testcaseID")}
                >
                  <div className="flex items-center">
                    ID {getSortDirectionIcon("testcaseID")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort("description")}
                >
                  <div className="flex items-center">
                    Description {getSortDirectionIcon("description")}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[120px] cursor-pointer"
                  onClick={() => requestSort("priority")}
                >
                  <div className="flex items-center">
                    Priority {getSortDirectionIcon("priority")}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
                <TableHead className="w-[50px]">Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No test cases found
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {/* Heading row */}
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="bg-muted font-semibold text-base py-3"
                      >
                        {group.heading}
                      </TableCell>
                    </TableRow>

                    {/* Grouped test cases */}
                    {group.testcases.map((testCase, index) => {
                      const isEditing =
                        editingIndex?.[0] === groupIndex &&
                        editingIndex?.[1] === index;

                      return (
                        <TableRow
                          key={testCase.testcaseID}
                          className={isEditing ? "bg-muted/30" : ""}
                        >
                          {/* ID */}
                          <TableCell className="font-medium">
                            {isEditing ? (
                              <Input
                                value={editForm?.testcaseID || ""}
                                onChange={(e) =>
                                  handleFormChange("testcaseID", e.target.value)
                                }
                                className="w-full"
                              />
                            ) : (
                              testCase.testcaseID
                            )}
                          </TableCell>

                          {/* Description */}
                          <TableCell>
                            {isEditing ? (
                              <div className="space-y-4">
                                {/* Description field */}
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    Description
                                  </label>
                                  <Textarea
                                    value={editForm?.description || ""}
                                    onChange={(e) =>
                                      handleFormChange(
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="w-full"
                                    rows={2}
                                  />
                                </div>
                                {/* Steps */}
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    Steps (one per line)
                                  </label>
                                  <Textarea
                                    value={editForm?.steps.join("\n") || ""}
                                    onChange={(e) =>
                                      handleFormChange("steps", e.target.value)
                                    }
                                    className="w-full"
                                    rows={4}
                                  />
                                </div>
                                {/* Expected Results */}
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    Expected Results
                                  </label>
                                  <Textarea
                                    value={editForm?.expectedResults || ""}
                                    onChange={(e) =>
                                      handleFormChange(
                                        "expectedResults",
                                        e.target.value
                                      )
                                    }
                                    className="w-full"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ) : (
                              <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                              >
                                <AccordionItem
                                  value={testCase.testcaseID}
                                  className="border-0"
                                >
                                  <AccordionTrigger className="py-0 hover:no-underline">
                                    <span className="text-left">
                                      {testCase.description}
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="mt-2 space-y-4">
                                      <div>
                                        <h4 className="font-semibold text-sm">
                                          Steps:
                                        </h4>
                                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                                          {testCase.steps.map(
                                            (step, stepIndex) => (
                                              <li
                                                key={stepIndex}
                                                className="text-sm"
                                              >
                                                {step}
                                              </li>
                                            )
                                          )}
                                        </ol>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-sm">
                                          Expected Results:
                                        </h4>
                                        <p className="text-sm mt-1">
                                          {testCase.expectedResults}
                                        </p>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            )}
                          </TableCell>

                          {/* Priority */}
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={editForm?.priority || "Medium"}
                                onValueChange={(value) =>
                                  handleFormChange(
                                    "priority",
                                    value as "High" | "Medium" | "Low"
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                variant={
                                  priorityColors[
                                    testCase.priority as keyof typeof priorityColors
                                  ] as
                                    | "default"
                                    | "secondary"
                                    | "destructive"
                                    | "outline"
                                    | "warning"
                                }
                              >
                                {testCase.priority}
                              </Badge>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            {isEditing ? (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={saveTestCase}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  startEditing(groupIndex, index, testCase)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button className=" bg-green-600 text-white rounded-lg">
                              Generate Code
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  );
}
