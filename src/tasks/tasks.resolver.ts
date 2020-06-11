import { Injectable, UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver, Root, Query } from '@nestjs/graphql'
import { MutationCreateTaskArgs, QueryTasksArgs, TaskInput } from '../app/generated'
import { AuthGuard, AuthUser } from '../auth'
import ProjectsService from '../projects/projects.service'
import UserEntity from '../users/user.entity'
import UsersService from '../users/users.service'
import TaskEntity from './task.entity'
import TasksService from './tasks.service'

@Injectable()
@Resolver(() => TaskEntity)
export default class TasksResolver {
  constructor(
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private usersService: UsersService
  ) {}

  @Mutation()
  @UseGuards(AuthGuard)
  async createTask(
    @AuthUser() user: UserEntity,
    @Args() { input: { projectId, assignedId, ...input } }: MutationCreateTaskArgs
  ) {
    return this.tasksService.create({
      ...input,
      assignedId: assignedId ? parseInt(assignedId) : null,
      projectId: parseInt(projectId),
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

  @ResolveField()
  assigned(@Root() { assignedId }: TaskEntity) {
    if (!assignedId) {
      return null
    }
    return this.usersService.findOne({ id: assignedId })
  }
}
