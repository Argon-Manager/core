import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import {
  MutationCreateProjectArgs,
  MutationDeleteProjectArgs,
  MutationUpdateProjectArgs,
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
    const id = parseInt(args.id)

    if (await this.projectsService.includesUser({ projectId: id, userId: user.id })) {
      return this.projectsService.findById(id)
    }

    return null
  }

  @Query()
  @UseGuards(AuthGuard)
  async authUserProjects(@AuthUser() user: UserEntity) {
    return this.projectsService.findMany({ userIds: [user.id] })
  }

  @Mutation()
  @UseGuards(AuthGuard)
  async createProject(
    @AuthUser() user: UserEntity,
    @Args() { input: { userIds, ...restInput } }: MutationCreateProjectArgs
  ) {
    return this.projectsService.create({
      ...restInput,
      userIds: [user.id, ...(userIds?.map((id) => parseInt(id)) ?? [])],
    })
  }

  @Mutation()
  @UseGuards(AuthGuard)
  async updateProject(
    @AuthUser() user: UserEntity,
    @Args() { input: { userIds, ...restInput }, id }: MutationUpdateProjectArgs
  ) {
    const projectId = parseInt(id)

    if (await this.projectsService.includesUser({ projectId, userId: user.id })) {
      return this.projectsService.updateById(parseInt(id), {
        ...restInput,
        userIds: [user.id, ...(userIds?.map((id) => parseInt(id)) ?? [])],
      })
    }

    return null
  }

  @Mutation()
  @UseGuards(AuthGuard)
  async deleteProject(@AuthUser() user: UserEntity, @Args() { id }: MutationDeleteProjectArgs) {
    const projectId = parseInt(id)

    if (await this.projectsService.includesUser({ projectId, userId: user.id })) {
      return this.projectsService.deleteById(projectId)
    }

    return null
  }

  @ResolveField()
  async users(@Parent() { id }: ProjectEntity) {
    return await this.projectsService.getUsersByProjectId(id)
  }
}
