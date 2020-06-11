import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver, Root } from '@nestjs/graphql'
import { MutationCreateWorkspaceArgs } from '../app/generated'
import { AuthGuard, AuthUser } from '../auth'
import ProjectsService from '../projects/projects.service'
import UserEntity from '../users/user.entity'
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
    @Args() { input }: MutationCreateWorkspaceArgs
  ) {
    return this.workspacesService.create({
      ...input,
      userIds: [user.id, ...(input.userIds?.map((id) => parseInt(id)) ?? [])],
    })
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
