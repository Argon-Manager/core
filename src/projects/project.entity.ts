import { ObjectType } from '@nestjs/graphql'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import TaskEntity from '../tasks/task.entity'
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
    () => TaskEntity,
    (task) => task.project
  )
  tasks: TaskEntity[]
}
