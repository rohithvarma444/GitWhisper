'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import useProjects from '@/hooks/use-projects'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Loader2, Check, Minimize2, Maximize2, X, MessageSquare, Search, Clock, Filter, SortAsc, Info } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AskQuestion from '../dashboard/ask-question'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SaasDialog, SaasDialogFooter } from "@/components/ui/saas-dialog";

interface FileReference {
  path: string
  line?: number
  fileName?: string
  sourceCode?: string
  summary?: string
  [key: string]: any // Add this index signature
}

interface Question {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
  fileReferences: FileReference[] | null; // Remove undefined from the type
  projectId: string;
  userId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
    credits: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

function QaPage() {
  const { projectId } = useProjects()
  const router = useRouter();
  
  useEffect(() => {
    if (!projectId) {
      router.push('/create');
    }
  }, [projectId, router]);

  const { data: questions } = api.project.getQuestions.useQuery<Question[]>({ projectId })
  const [questionIndex, setQuestionIndex] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const answerRef = useRef<HTMLDivElement>(null)
  
  const question = questions ? questions[questionIndex] : undefined

  useEffect(() => {
    if (answerRef.current && openDialog) {
      answerRef.current.scrollTop = 0;
    }
  }, [openDialog]);

  const handleQuestionClick = (index: number) => {
    setQuestionIndex(index)
    setOpenDialog(true)
    setSelectedFile(null)
  }
  
  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFollowUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    toast.info("Follow-up questions feature coming soon!");
    setLoading(false);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="mb-10 space-y-2">
        <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
          GitWhisper AI Assistant
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Question & Answer</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Ask questions about your codebase and get AI-powered answers with code references.
        </p>
      </div>
      
      {/* Ask Question Card with improved styling */}
      <Card className="shadow-md border-border/60 mb-10 overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/40">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Ask a Question
          </CardTitle>
          <CardDescription>
            Get instant answers about your codebase from our AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AskQuestion />
        </CardContent>
      </Card>

      {/* Saved Questions Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Questions</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search questions..." 
              className="pl-9 w-[200px] h-9"
            />
          </div>
          
          <Tabs defaultValue="all" className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all" onClick={() => setActiveTab('all')}>All</TabsTrigger>
              <TabsTrigger value="recent" onClick={() => setActiveTab('recent')}>Recent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {!questions || questions.length === 0 ? (
        <Card className="shadow-md border-border/60 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted/30 p-3 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No saved questions yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Questions you ask will appear here for future reference. Start by asking a question above.
            </p>
          </CardContent>
        </Card>
      ) : (
        // Inside the QaPage component, update the card rendering:
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {questions.map((q, index) => (
            <Card 
              key={q.id}
              className="shadow-md border-border/60 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer overflow-hidden bg-gradient-to-br from-white to-muted/20 dark:from-background dark:to-muted/10"
              onClick={() => handleQuestionClick(index)}
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/20">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-medium line-clamp-1">
                    {q.question}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-normal bg-background/80 whitespace-nowrap">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDate(q.createdAt)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="rounded-full overflow-hidden h-8 w-8 border border-border/60 bg-primary/5">
                      <img
                        src={q.user.imageUrl ?? '/default-avatar.png'}
                        alt={`${q.user.firstName || 'User'}'s avatar`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {q.answer}
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 border-t border-border/30 mt-2 text-xs text-muted-foreground bg-muted/10">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {q.fileReferences?.length || 0} file references
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Question Detail Dialog - Updated with SaasDialog */}
      <SaasDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog}
        title={question?.question || "Question Details"}
        isCompact={isCompact}
        onToggleCompact={() => setIsCompact(!isCompact)}
      >
        <Tabs defaultValue="answer" value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 overflow-hidden flex flex-col">
          <div className="border-b px-6 py-2 bg-muted/30">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="answer">Answer</TabsTrigger>
              <TabsTrigger value="references">References ({question?.fileReferences?.length || 0})</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="answer" className="flex-1 overflow-auto">
            {/* Answer content */}
            <div className="px-6 py-4">
              <div className="prose max-w-none mb-6">
                <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                  // Add proper null checking for question.answer
                  <div className="text-card-foreground leading-relaxed">
                    <ReactMarkdown>{question?.answer || ""}</ReactMarkdown>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  // Fix the copy button to handle undefined
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(question?.answer || "")}>
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
                </div>
              </div>
            </div>

            {/* File references section with improved styling */}
            {question && Array.isArray(question.fileReferences) && question.fileReferences.length > 0 && (
              <div className="px-6 pb-6">
                <div className="border-t border-border pt-4 mt-2">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-1">
                    <Info className="h-4 w-4 text-primary" />
                    Referenced Files
                  </h3>
                  
                  {/* Horizontal file list with scrolling */}
                  <div className="mb-4 overflow-x-auto pb-2">
                    <div className="flex space-x-2">
                      {question.fileReferences.map((ref: FileReference, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedFile(ref.fileName || ref.path || '')}
                          className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-md text-xs ${
                            selectedFile === (ref.fileName || ref.path)
                              ? "bg-primary text-primary-foreground font-medium"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          }`}
                        >
                          {(ref.fileName || ref.path || '').split('/').pop()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File content with improved styling */}
                  {selectedFile &&
                    question && // Add this check
                    (Array.isArray(question.fileReferences)
                      ? ((question.fileReferences as unknown[]).filter((ref): ref is FileReference =>
                          ref !== null &&
                          typeof ref === 'object' &&
                          'path' in ref &&
                          'sourceCode' in ref
                        ) as FileReference[])
                          .filter((ref) => (ref.fileName || ref.path) === selectedFile)
                      : []
                    ).map((ref, idx) => (
                        <div key={idx} className="rounded-lg border border-border overflow-hidden shadow-sm">
                          {ref.summary && (
                            <div className="p-3 bg-muted/30 border-b border-border">
                              <h5 className="text-xs font-semibold mb-1 uppercase text-primary">Summary</h5>
                              <div className="p-2 bg-card rounded-md border border-border">
                                <p className="text-sm text-card-foreground whitespace-pre-wrap">{ref.summary}</p>
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="px-3 py-2 bg-gray-800 text-white flex justify-between items-center">
                              <h5 className="text-xs font-semibold uppercase">{(ref.fileName || ref.path || '').split('/').pop()}</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(ref.sourceCode || '')}
                                className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="rounded-b-lg overflow-hidden">
                              {ref.sourceCode ? (
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
                                    style: { 
                                      display: 'block', 
                                      width: '100%'
                                    }
                                  })}
                                >
                                  {ref.sourceCode}
                                </SyntaxHighlighter>
                              ) : (
                                <div className="p-4 bg-muted text-muted-foreground text-sm">
                                  Code content not available
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="references" className="flex-1 overflow-auto p-6">
            {/* References content */}
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
    </div>
  );
}

export default QaPage