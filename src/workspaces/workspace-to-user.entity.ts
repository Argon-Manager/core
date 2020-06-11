import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import UserEntity from '../users/user.entity'
import WorkspaceEntity from './workspace.entity'

@Entity()
export default class WorkspaceToUserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column()
  workspaceId: number

  @ManyToOne(
    () => WorkspaceEntity,
    (workspace) => workspace.workspaceToUser
  )
  workspace: WorkspaceEntity

  @ManyToOne(
    () => UserEntity,
    (user) => user.workspaceToUser
  )
  user: UserEntity
}
