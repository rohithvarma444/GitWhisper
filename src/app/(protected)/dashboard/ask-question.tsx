"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useProjects from "@/hooks/use-projects";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Loader2, Check, BookOpen, Save, Minimize2, Maximize2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type FileReference = {
  fileName: string;
  sourceCode: string;
  summary: string;
};

const AskQuestion: React.FC = () => {
  const { project } = useProjects();
  const router = useRouter();
  
  useEffect(() => {
    if (!project) {
      router.push("/create");
    }
  }, [project, router]);
  const [question, setQuestion] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [fileReferences, setFileReferences] = useState<FileReference[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("answer");
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false); // ✅ NEW
  const answerRef = useRef<HTMLDivElement>(null);

  const saveAnswerMutation = api.project.saveAnswer.useMutation();

  useEffect(() => {
    if (answerRef.current && !loading) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer, loading]);

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setLoading(false);
      setAnswer("");
      setSaved(false);
      setFileReferences([]);
      setSelectedFile(null);
      setActiveTab("answer");
      setIsCompact(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!project?.id) return;

    setLoading(true);
    setOpen(true);
    setAnswer("");
    setSaved(false); 

    try {
      const { output, fileReference } = await askQuestion(question, project.id);
      setFileReferences(fileReference || []);

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((prev) => prev + delta);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setAnswer("An error occurred while fetching the answer.");
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
        onSuccess: () => {
          toast.success("Answer saved successfully!");
          setSaved(true);
        },
        onError: (err) => {
          if ((err as Error).message === "Question already saved.") {
            toast.warning("This question is already saved.");
            setSaved(true);
          } else {
            toast.error("Failed to save answer.");
          }
        }
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
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent 
          className={`max-w-5xl ${isCompact ? 'h-[60vh]' : 'h-[85vh]'} p-0 rounded-xl overflow-hidden flex flex-col`}
          style={{ maxHeight: '90vh' }}
        >
          <DialogHeader className="px-6 py-3 border-b bg-gray-50 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-800">GitRAG</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCompact(!isCompact)}
                  className="p-1 h-8 w-8"
                >
                  {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="p-1 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500 truncate">
              <span className="font-medium">Question:</span> {question}
            </div>
          </DialogHeader>

          <Tabs defaultValue="answer" value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 overflow-hidden flex flex-col">
            <TabsContent value="answer" className="flex-1 overflow-hidden flex flex-col">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8 flex-1">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600">Processing your question...</p>
                </div>
              ) : (
                <div className="flex flex-col h-full overflow-y-auto" ref={answerRef}>
                  <div className="px-6 py-4">
                    <div className="prose max-w-none mb-6">
                      <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="text-gray-800 leading-relaxed">
                          <ReactMarkdown>{answer}</ReactMarkdown>
                        </div>
                      </div>
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
                          variant="primary"
                          size="sm"
                          onClick={handleSaveAnswer}
                          disabled={saveAnswerMutation.isLoading || saved}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          {saveAnswerMutation.isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {saved ? "Already Saved" : "Save Answer"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {fileReferences.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-200 pt-4 mt-2">
                        <h3 className="text-sm font-semibold mb-3 text-gray-800">Referenced Files</h3>
                        <div className="mb-4 overflow-x-auto pb-2">
                          <div className="flex space-x-2">
                            {fileReferences.map((ref, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedFile(ref.fileName)}
                                className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-md text-xs ${
                                  selectedFile === ref.fileName
                                    ? "bg-primary text-white font-medium"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                }`}
                              >
                                {ref.fileName.split("/").pop()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {selectedFile &&
                          fileReferences
                            .filter((ref) => ref.fileName === selectedFile)
                            .map((ref, idx) => (
                              <div key={idx} className="rounded-lg border border-gray-200 overflow-hidden">
                                <div className="p-3 bg-gray-50 border-b border-gray-200">
                                  <h5 className="text-xs font-semibold mb-1 text-gray-800 uppercase">Summary</h5>
                                  <div className="p-2 bg-white rounded-md border border-gray-100">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{ref.summary}</p>
                                  </div>
                                </div>

                                <div>
                                  <div className="px-3 py-2 bg-gray-800 text-white flex justify-between items-center">
                                    <h5 className="text-xs font-semibold uppercase">{ref.fileName.split('/').pop()}</h5>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(ref.sourceCode)}
                                      className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="rounded-b-lg overflow-hidden">
                                    <SyntaxHighlighter
                                      language="tsx"
                                      style={oneDark}
                                      customStyle={{
                                        padding: "1rem",
                                        backgroundColor: "#1e1e1e",
                                        fontSize: "0.875rem",
                                        lineHeight: "1.5",
                                        margin: 0
                                      }}
                                      showLineNumbers={true}
                                      wrapLines={true}
                                      lineProps={lineNumber => ({
                                        style: { display: 'block', width: '100%' }
                                      })}
                                    >
                                      {ref.sourceCode}
                                    </SyntaxHighlighter>
                                  </div>
                                </div>
                              </div>
                            ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="px-6 py-3 border-t bg-gray-50 sticky bottom-0 z-10">
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
                    Asking
                  </>
                ) : (
                  "Ask"
                )}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-2xl p-4 shadow-lg border border-gray-200 rounded-lg bg-white hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="bg-blue-100 p-1 rounded-md text-blue-600 mr-2">
                <BookOpen className="h-4 w-4" />
              </span>
              Ask a Question
            </CardTitle>
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
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Question"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AskQuestion;