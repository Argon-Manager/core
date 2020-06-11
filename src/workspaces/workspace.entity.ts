import { ObjectType } from '@nestjs/graphql'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import ProjectToUserEntity from '../projects/project-to-user.entity'
import ProjectEntity from '../projects/project.entity'
import TaskEntity from '../tasks/task.entity'
import WorkspaceToUserEntity from './workspace-to-user.entity'

@ObjectType('Workspace')
@Entity()
export default class WorkspaceEntity {
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
    () => WorkspaceToUserEntity,
    (workspaceToUser) => workspaceToUser.workspace
  )
  workspaceToUser: ProjectToUserEntity[]

  @OneToMany(
    () => TaskEntity,
    (task) => task.project
  )
  tasks: TaskEntity[]

  @Column()
  projectId: number

  @ManyToOne(
    () => ProjectEntity,
    (project) => project.tasks
  )
  project: ProjectEntity
}
