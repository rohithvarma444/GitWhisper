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
import { Copy, Loader2, Check, Minimize2, Maximize2, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import AskQuestion from '../dashboard/ask-question'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface FileReference {
  path: string
  line?: number
  fileName?: string
  sourceCode?: string
  summary?: string
}

function QaPage() {
  const { projectId } = useProjects()
  const router = useRouter();
  
  useEffect(() => {
    if (!projectId) {
      router.push('/create');
    }
  }, [projectId, router]);

  const { data: questions } = api.project.getQuestions.useQuery({ projectId })
  const [questionIndex, setQuestionIndex] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const answerRef = useRef<HTMLDivElement>(null)
  
  const question = questions ? questions[questionIndex] : undefined

  // Automatically scroll to the bottom when dialog opens
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
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
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
    // Here you would implement the follow-up question logic
    // Similar to how it's handled in the AskQuestion component
    setLoading(true);
    
    // Placeholder for demonstration
    toast.info("Follow-up questions feature coming soon!");
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-10">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <AskQuestion />
      </div>

      {!questions || questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No saved questions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Saved Questions</h2>
          <div className="grid gap-3">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleQuestionClick(index)}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={q.user.imageUrl ?? '/default-avatar.png'}
                    alt={`${q.user.firstName || 'User'}'s avatar`}
                    className="rounded-full h-10 w-10 object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate text-base">
                        {q.question}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {q.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Detail Dialog - Similar to AskQuestion dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {question && (
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
                    onClick={() => setOpenDialog(false)}
                    className="p-1 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-500 truncate">
                <span className="font-medium">Question:</span> {question.question}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex flex-col h-full overflow-y-auto" ref={answerRef}>
                {/* Answer content */}
                <div className="px-6 py-4">
                  <div className="prose max-w-none mb-6">
                    <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="text-gray-800 leading-relaxed">
                        <ReactMarkdown>{question.answer}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(question.answer)}>
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

                {/* File references section */}
                {Array.isArray(question.fileReferences) && question.fileReferences.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <h3 className="text-sm font-semibold mb-3 text-gray-800">Referenced Files</h3>
                      
                      {/* Horizontal file list with scrolling */}
                      <div className="mb-4 overflow-x-auto pb-2">
                        <div className="flex space-x-2">
                          {question.fileReferences.map((ref: FileReference, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedFile(ref.fileName || ref.path || '')}
                              className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-md text-xs ${
                                selectedFile === (ref.fileName || ref.path)
                                  ? "bg-primary text-white font-medium"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                              }`}
                            >
                              {(ref.fileName || ref.path || '').split('/').pop()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* File content */}
                      {selectedFile &&
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
                            <div key={idx} className="rounded-lg border border-gray-200 overflow-hidden">
                              {ref.summary && (
                                <div className="p-3 bg-gray-50 border-b border-gray-200">
                                  <h5 className="text-xs font-semibold mb-1 text-gray-800 uppercase">Summary</h5>
                                  <div className="p-2 bg-white rounded-md border border-gray-100">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{ref.summary}</p>
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
                                    <div className="p-4 bg-gray-100 text-gray-600 text-sm">
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
              </div>
            </div>

            <DialogFooter className="px-6 py-3 border-t bg-gray-50 sticky bottom-0 z-10">
              <form onSubmit={handleFollowUpSubmit} className="flex w-full gap-2">
                <Input
                  type="text"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
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
        )}
      </Dialog>
    </div>
  )
}

export default QaPage