import { ObjectType } from '@nestjs/graphql'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '../app/generated'
import ProjectEntity from '../projects/project.entity'
import UserEntity from '../users/user.entity'

@ObjectType('Task')
@Entity()
export default class TaskEntity {
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

  @Column({ nullable: true })
  assignedId?: number

  @ManyToOne(
    () => UserEntity,
    (user) => user.tasks
  )
  assigned?: User

  @Column()
  projectId: number

  @ManyToOne(
    () => ProjectEntity,
    (project) => project.tasks
  )
  project: ProjectEntity
}
