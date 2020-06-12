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
import ProjectEntity from '../projects/project.entity'
import TaskEntity from '../tasks/task.entity'
import SprintToUserEntity from './sprint-to-user.entity'

@ObjectType('Sprint')
@Entity('sprint')
export default class SprintEntity {
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
    () => SprintToUserEntity,
    (sprintToUser) => sprintToUser.sprint
  )
  sprintToUser: SprintToUserEntity[]

  @OneToMany(
    () => TaskEntity,
    (task) => task.sprint
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
