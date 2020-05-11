import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import UserEntity from '../users/user.entity'
import ProjectEntity from './project.entity'

@Entity()
export default class ProjectToUserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column()
  projectId: number

  @ManyToOne(
    () => ProjectEntity,
    (project) => project.projectToUser
  )
  project: ProjectEntity

  @ManyToOne(
    () => UserEntity,
    (user) => user.projectToUser
  )
  user: ProjectEntity
}
