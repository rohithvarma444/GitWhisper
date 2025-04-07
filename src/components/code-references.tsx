import React from 'react'

interface FileReference {
  path: string
  line?: number
}

interface CodeReferencesProps {
  fileReferences: FileReference[]
}

export function CodeReferences({ fileReferences }: CodeReferencesProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Referenced Files:</h3>
      <ul className="list-disc pl-5 space-y-1">
        {fileReferences.map((ref, index) => (
          <li key={index} className="text-sm text-gray-600">
            {ref.path}
            {ref.line && `:${ref.line}`}
          </li>
        ))}
      </ul>
    </div>
  )
} 