import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver, Root } from '@nestjs/graphql'
import { ProjectInput } from '../app/generated'
import { AuthGuard, AuthUser } from '../auth'
import UserEntity from '../users/user.entity'
import ProjectEntity from './project.entity'
import ProjectsService from './projects.service'

@Resolver(() => ProjectEntity)
export default class ProjectsResolver {
  constructor(private projectsService: ProjectsService) {}

  @Mutation()
  @UseGuards(AuthGuard)
  async createProject(@AuthUser() user: UserEntity, @Args('input') input: ProjectInput) {
    return this.projectsService.create({ ...input, userIds: [user.id] })
  }

  @ResolveField()
  async users(@Parent() { id }: ProjectEntity) {
    return await this.projectsService.getProjectUsers({ projectId: id })
  }
}
