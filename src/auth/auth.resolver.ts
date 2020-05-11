import { Query, Resolver } from '@nestjs/graphql'

@Resolver()
export default class AuthResolver {
  @Query()
  me() {
    return "me"
  }
}