export type Maybe<T> = T | null
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

export type Query = {
  __typename?: 'Query'
  authUserProjects: Array<Project>
  me?: Maybe<User>
  project?: Maybe<Project>
  tasks: Array<Task>
}

export type QueryProjectArgs = {
  id: Scalars['ID']
}

export type QueryTasksArgs = {
  projectId: Scalars['ID']
}

export type Mutation = {
  __typename?: 'Mutation'
  createProject: Project
  createTask: Task
  createWorkspace: Workspace
  deleteProject?: Maybe<Scalars['Int']>
  login?: Maybe<Auth>
  register: Auth
  updateProject?: Maybe<Project>
}

export type MutationCreateProjectArgs = {
  input: ProjectInput
}

export type MutationCreateTaskArgs = {
  input: TaskInput
}

export type MutationCreateWorkspaceArgs = {
  input: WorkspaceInput
}

export type MutationDeleteProjectArgs = {
  id: Scalars['ID']
}

export type MutationLoginArgs = {
  input: LoginInput
}

export type MutationRegisterArgs = {
  input: RegisterInput
}

export type MutationUpdateProjectArgs = {
  id: Scalars['ID']
  input: ProjectInput
}

export type Auth = {
  __typename?: 'Auth'
  user: User
  token: Scalars['String']
}

export type RegisterInput = {
  email: Scalars['String']
  password: Scalars['String']
}

export type LoginInput = {
  email: Scalars['String']
  password: Scalars['String']
}

export type Project = {
  __typename?: 'Project'
  id: Scalars['ID']
  name: Scalars['String']
  description?: Maybe<Scalars['String']>
  users: Array<Maybe<User>>
}

export type ProjectInput = {
  name: Scalars['String']
  description?: Maybe<Scalars['String']>
  userIds?: Maybe<Array<Scalars['ID']>>
}

export type Task = {
  __typename?: 'Task'
  id: Scalars['ID']
  name: Scalars['String']
  projectId: Scalars['ID']
  project: Project
  description?: Maybe<Scalars['String']>
  assignedId?: Maybe<Scalars['ID']>
  assigned?: Maybe<User>
}

export type TaskInput = {
  name: Scalars['String']
  projectId: Scalars['ID']
  description?: Maybe<Scalars['String']>
  assignedId?: Maybe<Scalars['ID']>
}

export type User = {
  __typename?: 'User'
  id: Scalars['ID']
  email: Scalars['String']
}

export type Workspace = {
  __typename?: 'Workspace'
  id: Scalars['ID']
  name: Scalars['String']
  description?: Maybe<Scalars['String']>
  projectId: Scalars['ID']
  project: Project
  users: Array<User>
}

export type WorkspaceInput = {
  name: Scalars['String']
  description?: Maybe<Scalars['String']>
  projectId: Scalars['ID']
  userIds?: Maybe<Array<Scalars['ID']>>
}
