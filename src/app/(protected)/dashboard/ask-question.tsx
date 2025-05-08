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

import { SaasDialog, SaasDialogFooter } from "@/components/ui/saas-dialog";

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

  // Add this function after handleSaveAnswer
  const [followUpQuestion, setFollowUpQuestion] = useState<string>("");
  
  // Add this function to handle follow-up question submissions
  const handleFollowUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || loading) return;
    
    setLoading(true);
    
    try {
      // For now, just show a toast until the feature is implemented
      toast.info("Follow-up questions feature coming soon!");
      // Clear the input after submission
      setFollowUpQuestion("");
    } catch (error) {
      console.error("Error submitting follow-up question:", error);
      toast.error("Failed to process your follow-up question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SaasDialog 
        open={open} 
        onOpenChange={handleDialogClose}
        title="GitWhisper"
        description={question ? `Question: ${question}` : undefined}
        isCompact={isCompact}
        onToggleCompact={() => setIsCompact(!isCompact)}
      >
        <Tabs defaultValue="answer" value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 overflow-hidden flex flex-col">
          <div className="border-b px-6 py-2 bg-muted/30">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="answer">Answer</TabsTrigger>
              <TabsTrigger value="references">References ({fileReferences.length})</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="answer" className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 flex-1">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Processing your question...</p>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-y-auto" ref={answerRef}>
                <div className="px-6 py-4">
                  <div className="prose max-w-none mb-6">
                    <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                      <div className="text-card-foreground leading-relaxed">
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
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
                    <div className="border-t border-border pt-4 mt-2">
                      <h3 className="text-sm font-semibold mb-3">Referenced Files</h3>
                      <div className="mb-4 overflow-x-auto pb-2">
                        <div className="flex space-x-2">
                          {fileReferences.map((ref, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedFile(ref.fileName)}
                              className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-md text-xs ${
                                selectedFile === ref.fileName
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
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
                            <div key={idx} className="rounded-lg border border-border overflow-hidden">
                              <div className="p-3 bg-muted border-b border-border">
                                <h5 className="text-xs font-semibold mb-1 uppercase">Summary</h5>
                                <div className="p-2 bg-card rounded-md border border-border">
                                  <p className="text-sm text-card-foreground whitespace-pre-wrap">{ref.summary}</p>
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
          
          <TabsContent value="references" className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 flex-1">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Processing your question...</p>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-y-auto" ref={answerRef}>
                <div className="px-6 py-4">
                  <div className="prose max-w-none mb-6">
                    <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                      <div className="text-card-foreground leading-relaxed">
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
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
                    <div className="border-t border-border pt-4 mt-2">
                      <h3 className="text-sm font-semibold mb-3">Referenced Files</h3>
                      <div className="mb-4 overflow-x-auto pb-2">
                        <div className="flex space-x-2">
                          {fileReferences.map((ref, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedFile(ref.fileName)}
                              className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-md text-xs ${
                                selectedFile === ref.fileName
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
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
                            <div key={idx} className="rounded-lg border border-border overflow-hidden">
                              <div className="p-3 bg-muted border-b border-border">
                                <h5 className="text-xs font-semibold mb-1 uppercase">Summary</h5>
                                <div className="p-2 bg-card rounded-md border border-border">
                                  <p className="text-sm text-card-foreground whitespace-pre-wrap">{ref.summary}</p>
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
        
        <SaasDialogFooter>
          <form onSubmit={handleFollowUpSubmit} className="flex w-full gap-2">
            <Input
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={!followUpQuestion.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </form>
        </SaasDialogFooter>
      </SaasDialog>
      
      <div className="w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-2xl p-4 shadow-lg border border-border rounded-lg bg-card hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center">
              <span className="bg-primary/10 p-1 rounded-md text-primary mr-2">
                <BookOpen className="h-4 w-4" />
              </span>
              Ask a Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3 text-sm">Have any questions about your project? Ask here.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Where is login handled?"
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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