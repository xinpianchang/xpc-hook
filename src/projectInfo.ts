export interface IProjectInfo {
  title: string
}

export interface IProjectContent {
  name: string
}

export default function createProjectInfo (projectContent: IProjectContent): IProjectInfo {
  return {
    title: `${projectContent.name}.tsw`
  }
}
