import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import ProjectToUserEntity from '../projects/project-to-user.entity'

@Entity()
export default class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  passwordHash: string

  @OneToMany(
    () => ProjectToUserEntity,
    (projectToUser) => projectToUser.user
  )
  projectToUser: ProjectToUserEntity[]
}
