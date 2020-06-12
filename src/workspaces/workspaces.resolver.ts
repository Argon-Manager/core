import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver, Root, Query } from '@nestjs/graphql'
import { MutationCreateWorkspaceArgs } from '../app/generated'
import { AuthGuard, AuthUser } from '../auth'
import { ProjectsService } from '../projects'
import { UserEntity } from '../users'
import WorkspaceEntity from './workspace.entity'
import WorkspacesService from './workspaces.service'

@Resolver(() => WorkspaceEntity)
export default class WorkspacesResolver {
  constructor(
    private workspacesService: WorkspacesService,
    private projectsService: ProjectsService
  ) {}

  @Mutation()
  @UseGuards(AuthGuard)
  async createWorkspace(
    @AuthUser() user: UserEntity,
    @Args() { input: { userIds, projectId, ...restInput } }: MutationCreateWorkspaceArgs
  ) {
    return this.workspacesService.create({
      ...restInput,
      userIds: [user.id, ...(userIds?.map((id) => parseInt(id)) ?? [])],
      projectId: parseInt(projectId),
    })
  }

  @Query()
  @UseGuards(AuthGuard)
  authUserWorkspaces(@AuthUser() user: UserEntity) {
    return this.workspacesService.findMany({ userIds: [user.id] })
  }

  @ResolveField()
  project(@Root() { projectId }: WorkspaceEntity) {
    return this.projectsService.findById(projectId)
  }

  @ResolveField()
  async users(@Parent() { id }: WorkspaceEntity) {
    return await this.workspacesService.getUsersByWorkspaceId(id)
  }
}
