import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import bcrypt from 'bcrypt'
import { FindConditions, In, Repository } from 'typeorm'
import { RegisterInput } from '../app/generated'
import UserEntity from './user.entity'

@Injectable()
export default class UsersService {
  constructor(@InjectRepository(UserEntity) public userRepository: Repository<UserEntity>) {}

  async create({ password, email }: RegisterInput) {
    return this.userRepository.save(
      this.userRepository.create({
        email,
        passwordHash: await bcrypt.hash(password, 10),
      })
    )
  }

  async findOne(where: { id?: number; email?: string }) {
    return this.userRepository.findOne(where)
  }

  async find({ userIds }: { userIds?: number[] } = {}) {
    const where: FindConditions<UserEntity> = {}

    if (userIds) {
      where.id = In(userIds)
    }

    return this.userRepository.find({ where })
  }

  async comparePasswords(password, hash) {
    return bcrypt.compare(password, hash)
  }
}
