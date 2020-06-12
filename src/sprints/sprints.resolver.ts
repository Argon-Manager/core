import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, ResolveField, Resolver, Root } from '@nestjs/graphql'
import { MutationCreateSprintArgs, QuerySprintsArgs } from '../app/generated'
import { AuthGuard, AuthUser } from '../auth'
import { ProjectsService } from '../projects'
import { UserEntity } from '../users'
import SprintEntity from './sprint.entity'
import SprintsService from './sprints.service'

@Resolver(() => SprintEntity)
export default class SprintsResolver {
  constructor(private sprintsService: SprintsService, private projectsService: ProjectsService) {}

  @Mutation()
  @UseGuards(AuthGuard)
  createSprint(
    @AuthUser() user: UserEntity,
    @Args() { input: { projectId, workspaceId, userIds, ...restInput } }: MutationCreateSprintArgs
  ) {
    return this.sprintsService.create({
      ...restInput,
      projectId: parseInt(projectId),
      workspaceId: workspaceId ? parseInt(workspaceId) : null,
      userIds: [user.id, ...(userIds?.map((id) => parseInt(id)) ?? [])],
    })
  }

  @Query()
  @UseGuards(AuthGuard)
  sprints(@Args() { projectId }: QuerySprintsArgs) {
    return this.sprintsService.findMany({ projectId: parseInt(projectId) })
  }

  @ResolveField()
  project(@Root() { projectId }: SprintEntity) {
    return this.projectsService.findById(projectId)
  }

  @ResolveField()
  users(@Root() { id }: SprintEntity) {
    return this.sprintsService.getUsersBySprintId(id)
  }
}
