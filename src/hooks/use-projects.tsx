import React from 'react'
import { api } from '@/trpc/react'
import { useLocalStorage } from 'usehooks-ts'

const useProjects = () => {
  const {data: projects} = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage('gitrag-projectId', '');
  const project = projects?.find(project => project.id === projectId);
  return {
    projects,
    project,
    setProjectId,
    projectId
  }
}

export default useProjects