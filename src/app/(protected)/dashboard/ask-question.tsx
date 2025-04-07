import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import useProjects from "@/hooks/use-projects";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Loader2, Check, BookOpen, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { api } from "@/trpc/react";

const AskQuestion = () => {
  const { project } = useProjects();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [fileReferences, setFileReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<{ fileName: string; sourceCode: string } | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("answer");

  // Fix: Properly use useMutation
  const saveAnswerMutation = api.project.saveAnswer.useMutation();

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setLoading(false);
      setAnswer("");
      setFileReferences([]);
      setSelectedFile(null);
      setActiveTab("answer");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!project?.id) return;

    setLoading(true);
    setOpen(true);
    setAnswer(""); 

    try {
      const { output, fileReference } = await askQuestion(question, project.id);
      setFileReferences(fileReference || []);

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((ans) => ans + delta);
        }
      }
    } catch (error) {
      console.error(error);
      setAnswer("An error occurred while fetching the answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnswer = async () => {
    if (!project?.id || !answer.trim()) {
      toast.error("No answer to save!");
      return;
    }

    saveAnswerMutation.mutate(
      {
        projectId: project.id,
        question: question,
        answer: answer,
        fileReferences: fileReferences,
      },
      {
        onSuccess: () => toast.success("Answer saved successfully!"),
        onError: () => toast.error("Failed to save answer."),
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Answer Dialog */}
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl p-0 rounded-xl overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-800">GitRAG</DialogTitle>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Question:</span> {question}
            </div>
          </DialogHeader>

          <Tabs defaultValue="answer" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="px-6 pt-2 bg-white border-b">
              <TabsTrigger value="answer" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Answer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="answer" className="p-6 overflow-auto max-h-96">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600">Processing your question...</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="prose max-w-none">
                    <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="text-gray-800 leading-relaxed">
                        <ReactMarkdown>{answer}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  {answer && (
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(answer)}>
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSaveAnswer}
                        disabled={saveAnswerMutation.isLoading}
                      >
                        {saveAnswerMutation.isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Answer
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="px-6 py-3 border-t bg-gray-50">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Ask"
                )}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Input Card */}
      <Card className="p-6 shadow-lg border border-gray-200 rounded-lg max-w-lg w-full bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-3 text-sm">Have any questions about your project? Ask here.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Where is login handled?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestion;