import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver, Root, Query } from '@nestjs/graphql'
import {
  MutationCreateWorkspaceArgs,
  QueryWorkspaceArgs,
  QueryWorkspacesArgs,
} from '../app/generated'
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
  workspaces(@AuthUser() user: UserEntity, @Args() { projectId }: QueryWorkspacesArgs) {
    return this.workspacesService.findMany({ projectId: parseInt(projectId) })
  }

  @Query()
  @UseGuards(AuthGuard)
  workspace(@Args() { id }: QueryWorkspaceArgs) {
    return this.workspacesService.findById(parseInt(id))
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
