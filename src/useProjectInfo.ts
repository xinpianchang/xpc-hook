import { useContext } from 'react'
import { ProjectInfoContext } from './ProjectInfoContext'

export function useProjectInfo() {
  const projectInfo = useContext(ProjectInfoContext)
  if (!projectInfo) {
    throw new Error('useProjectContentInfo must be inside projectContentInfoContextProvider')
  }
  return projectInfo
}
