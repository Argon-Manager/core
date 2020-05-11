import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { sign, verify } from 'jsonwebtoken'

@Injectable()
export default class AuthService {
  constructor(private configService: ConfigService) {}

  createToken(id: number) {
    return sign({ id }, this.configService.get('JWT_KEY'))
  }

  verifyToken(authorization: string) {
    const token = authorization.split(' ')[1]

    return verify(token, this.configService.get('JWT_KEY')) as { id: number }
  }
}
