import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from '../users'
import AuthResolver from './auth.resolver'
import AuthService from './auth.service'

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [AuthResolver, AuthService],
  exports: [AuthResolver],
})
export default class AuthModule {}
