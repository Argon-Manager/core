import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import bcrypt from 'bcrypt'
import { RegisterInput } from '../app'
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

  findOne(where: { id?: number; email?: string }) {
    return this.userRepository.findOne(where)
  }

  async comparePasswords(password, hash) {
    return bcrypt.compare(password, hash)
  }
}
