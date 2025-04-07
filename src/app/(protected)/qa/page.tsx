'use client'
import useProjects from '@/hooks/use-projects'
import React, { useState } from 'react'
import { api } from '@/trpc/react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet'
import AskQuestion from '../dashboard/ask-question'
import MDEditor from '@uiw/react-md-editor'
import { CodeReferences } from '@/components/code-references'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FileReference {
  path: string
  line?: number
}

function QaPage() {
  const { projectId } = useProjects()
  const { data: questions } = api.project.getQuestions.useQuery({ projectId })
  const [questionIndex, setQuestionIndex] = useState(0)
  const question = questions?.[questionIndex]

  return (
    <Sheet>
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          {/* Ask Question Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <AskQuestion />
          </div>

          {/* Saved Questions Section */}
          <div>
            <h1 className="text-2xl font-bold mb-4">Saved Questions</h1>
            <div className="grid gap-4">
              {questions?.map((question, index) => (
                <SheetTrigger key={question.id} asChild>
                  <button
                    className="w-full text-left"
                    onClick={() => setQuestionIndex(index)}
                  >
                    <div className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-sm border hover:border-primary/50 transition-colors">
                      <img
                        src={question.user.imageUrl ?? ''}
                        alt={`${question.user.firstName || 'User'}'s avatar`}
                        className="rounded-full h-10 w-10 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {question.question}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {question.answer}
                        </p>
                      </div>
                    </div>
                  </button>
                </SheetTrigger>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question Detail Sheet */}
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold mb-4">
              {question.question}
            </SheetTitle>
            <ScrollArea className="h-[80vh] pr-4">
              <div className="prose prose-sm max-w-none">
                <MDEditor.Markdown source={question.answer} />
              </div>
              <div className="mt-6">
                <CodeReferences fileReferences={Array.isArray(question.fileReferences) ? (question.fileReferences as unknown as FileReference[]) : []} />
              </div>
            </ScrollArea>
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QaPage