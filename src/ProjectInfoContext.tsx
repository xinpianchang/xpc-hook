import React from 'react'
import { IProjectInfo } from './projectInfo'

export type ProjectContextProps = {
  projectInfo: IProjectInfo
}

export const ProjectInfoContext = React.createContext<IProjectInfo | null>(null)

export const ProjectContextProvider: React.FC<ProjectContextProps> = ({
  projectInfo,
  children
}) => {
  return <ProjectInfoContext.Provider value={projectInfo}>
    {children}
  </ProjectInfoContext.Provider>
}
