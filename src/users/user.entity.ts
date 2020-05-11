import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  passwordHash: string
}
