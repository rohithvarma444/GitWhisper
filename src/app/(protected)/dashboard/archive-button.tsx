'use client'
import { Button } from '@/components/ui/button'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import React, { use } from 'react'
import {toast} from 'sonner'
import useProjects from '@/hooks/use-projects'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'


function ArchiveButton() {
    const deleteProject = api.project.deleteProject.useMutation();
    const refetch = useRefetch();
    const { projectId } = useProjects();
    const router = useRouter();
    const handleDelete = () => {
        window.confirm("Are you sure you want to delete this project?") && 
        deleteProject.mutate({ projectId }, {
            onSuccess: () => {
                toast.success("Project deleted successfully");
                refetch();
                router.push("/dashboard")
            },
            onError: () => {
                toast.error("Project deletion failed");
            }
        });
    }

  return (
    <Button variant={"destructive"} onClick={handleDelete} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
      <span className="flex items-center gap-2">
        <Trash className="h-4 w-4" />
        Archive Project
      </span>

    </Button>
  )
}

export default ArchiveButton