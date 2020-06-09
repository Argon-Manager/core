import { Injectable, UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver, Root, Query } from '@nestjs/graphql'
import { MutationCreateTaskArgs, QueryTasksArgs, TaskInput } from '../app/generated'
import { AuthGuard, AuthUser } from '../auth'
import ProjectsService from '../projects/projects.service'
import UserEntity from '../users/user.entity'
import TaskEntity from './task.entity'
import TasksService from './tasks.service'

@Injectable()
@Resolver(() => TaskEntity)
export default class TasksResolver {
  constructor(private tasksService: TasksService, private projectsService: ProjectsService) {}

  @Mutation()
  @UseGuards(AuthGuard)
  async createTask(
    @AuthUser() user: UserEntity,
    @Args() { input: { assignedId, ...input } }: MutationCreateTaskArgs
  ) {
    // TODO: check if user belongs to project
    return this.tasksService.create({
      ...input,
      assignedId: assignedId ? parseInt(assignedId) : null,
    })
  }

  @Query()
  @UseGuards(AuthGuard)
  tasks(@AuthUser() user: UserEntity, @Args() { projectId }: QueryTasksArgs) {
    return this.tasksService.findMany({ projectIds: [parseInt(projectId)] })
  }

  @ResolveField()
  project(@Root() { projectId }: TaskEntity) {
    return this.projectsService.findById(projectId)
  }
}
