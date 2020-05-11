import { createParamDecorator } from '@nestjs/common'

const AuthUser = createParamDecorator((data: unknown, [_, __, ctx]) => {
  return ctx.req.authUser
})

export default AuthUser
