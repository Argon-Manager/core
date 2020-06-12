import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import UserEntity from '../users/user.entity'
import SprintEntity from './sprint.entity'

@Entity()
export default class SprintToUserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column()
  sprintId: number

  @ManyToOne(
    () => SprintEntity,
    (sprint) => sprint.sprintToUser
  )
  sprint: SprintEntity

  @ManyToOne(
    () => UserEntity,
    (user) => user.workspaceToUser
  )
  user: UserEntity
}
