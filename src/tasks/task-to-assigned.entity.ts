import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import UserEntity from '../users/user.entity'
import TaskEntity from './task.entity'

@Entity()
export default class TaskToAssignedEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column()
  projectId: number

  @ManyToOne(
    () => TaskEntity,
    (task) => task.taskToAssigned
  )
  task: TaskEntity

  @ManyToOne(
    () => UserEntity,
    (assigned) => assigned.taskToAssigned
  )
  assigned: UserEntity
}
