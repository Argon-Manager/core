import { ObjectType } from '@nestjs/graphql'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import SprintEntity from '../sprints/sprint.entity'
import TaskEntity from '../tasks/task.entity'
import WorkspaceEntity from '../workspaces/workspace.entity'
import ProjectToUserEntity from './project-to-user.entity'

@ObjectType('Project')
@Entity()
export default class ProjectEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  description?: string

  @CreateDateColumn()
  createdAt: Date

  @DeleteDateColumn()
  deletedAt?: Date

  @OneToMany(
    () => ProjectToUserEntity,
    (projectToUser) => projectToUser.project
  )
  projectToUser: ProjectToUserEntity[]

  @OneToMany(
    () => WorkspaceEntity,
    (workspace) => workspace.project
  )
  workspace: WorkspaceEntity[]

  @OneToMany(
    () => SprintEntity,
    (sprint) => sprint.project
  )
  sprints: SprintEntity[]

  @OneToMany(
    () => TaskEntity,
    (task) => task.project
  )
  tasks: TaskEntity[]
}
