import { ObjectType } from '@nestjs/graphql'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
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

  @OneToMany(
    () => ProjectToUserEntity,
    (projectToUser) => projectToUser.project
  )
  projectToUser: ProjectToUserEntity[]
}
