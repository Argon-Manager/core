import { createParamDecorator } from '@nestjs/common'

const AuthUser = createParamDecorator((data: unknown, [, , ctx]) => {
  return ctx.req.authUser
})

export default AuthUser
