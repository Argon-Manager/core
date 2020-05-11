import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import UsersService from '../users/users.service'
import AuthService from './auth.service'

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context)
    const req = ctx.getContext().req

    try {
      const authorization = req.header('Authorization')
      const payload = this.authService.verifyToken(authorization)

      req['authUser'] = await this.usersService.findOne({ id: payload.id })
    } catch (e) {
      new UnauthorizedException(e)
    }

    return true
  }
}
