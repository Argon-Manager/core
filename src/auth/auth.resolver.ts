import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { LoginInput, RegisterInput } from '../app'
import { UsersService } from '../users'
import UserEntity from '../users/user.entity'
import AuthUser from './auth-user'
import AuthGuard from './auth.guard'
import AuthService from './auth.service'

@Resolver()
export default class AuthResolver {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Query()
  @UseGuards(AuthGuard)
  me(@AuthUser() user: UserEntity) {
    return user
  }

  @Mutation()
  async register(@Args('input') input: RegisterInput) {
    const user = await this.usersService.create(input)

    return {
      user,
      token: this.authService.createToken(user.id),
    }
  }

  @Mutation()
  async login(@Args('input') { email, password }: LoginInput) {
    const user = await this.usersService.findOne({ email })

    if (!user) {
      return null
    }

    if (!(await this.usersService.comparePasswords(password, user.passwordHash))) {
      return null
    }

    return {
      user,
      token: this.authService.createToken(user.id),
    }
  }
}
