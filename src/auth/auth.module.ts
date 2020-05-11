import { Module } from '@nestjs/common'
import AuthResolver from './auth.resolver'

@Module({
  providers: [AuthResolver],
  exports: [AuthResolver]
})
export default class AuthModule {}