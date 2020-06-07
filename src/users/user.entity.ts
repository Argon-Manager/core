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
import TaskToAssignedEntity from '../tasks/task-to-assigned.entity'
import TaskEntity from '../tasks/task.entity'

@Entity()
export default class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  passwordHash: string

  @CreateDateColumn()
  createdAt: Date

  @DeleteDateColumn()
  deletedAt?: Date

  @OneToMany(
    () => ProjectToUserEntity,
    (projectToUser) => projectToUser.user
  )
  projectToUser: ProjectToUserEntity[]

  @OneToMany(
    () => TaskEntity,
    (task) => task.assigned
  )
  tasks: TaskEntity[]
}
