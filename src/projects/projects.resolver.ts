import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import {
  MutationDeleteProjectArgs,
  MutationUpdateProjectArgs,
  ProjectInput,
  QueryProjectArgs,
} from '../app/generated'
import { AuthGuard, AuthUser } from '../auth'
import UserEntity from '../users/user.entity'
import ProjectEntity from './project.entity'
import ProjectsService from './projects.service'

@Resolver(() => ProjectEntity)
export default class ProjectsResolver {
  constructor(private projectsService: ProjectsService) {}

  @Query()
  @UseGuards(AuthGuard)
  async project(@AuthUser() user: UserEntity, @Args() args: QueryProjectArgs) {
    // TODO: use parseInt decorator
    const id = parseInt(args.id)
    const project = await this.projectsService.findById(id)
    const users = await this.projectsService.getProjectUsers({ projectId: id })

    if (project && users.find(({ id }) => id === user.id)) {
      return project
    }

    return null
  }

  @Query()
  @UseGuards(AuthGuard)
  async projects(@AuthUser() user: UserEntity) {
    return this.projectsService.findMany({ userIds: [user.id] })
  }

  @Mutation()
  @UseGuards(AuthGuard)
  async createProject(@AuthUser() user: UserEntity, @Args('input') input: ProjectInput) {
    return this.projectsService.create({
      ...input,
      userIds: [user.id, ...(input.userIds?.map((id) => parseInt(id)) ?? [])],
    })
  }

  @Mutation()
  @UseGuards(AuthGuard)
  async updateProject(
    @AuthUser() user: UserEntity,
    @Args() { input, id }: MutationUpdateProjectArgs
  ) {
    // TODO: check owner
    return this.projectsService.updateById(parseInt(id), {
      ...input,
      userIds: [user.id, ...(input.userIds?.map((id) => parseInt(id)) ?? [])],
    })
  }

  @Mutation()
  @UseGuards(AuthGuard)
  async deleteProject(@AuthUser() user: UserEntity, @Args() { id }: MutationDeleteProjectArgs) {
    // TODO: check owner
    return this.projectsService.deleteById(parseInt(id))
  }

  @ResolveField()
  async users(@Parent() { id }: ProjectEntity) {
    return await this.projectsService.getProjectUsers({ projectId: id })
  }
}
