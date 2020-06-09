import { Injectable, UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver, Root } from '@nestjs/graphql'
import { TaskInput } from '../app/generated'
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
    @Args('input') { assignedId, ...input }: TaskInput
  ) {
    // TODO: check if user belongs to project
    return this.tasksService.create({
      ...input,
      assignedId: assignedId ? parseInt(assignedId) : null,
    })
  }

  @ResolveField()
  project(@Root() { projectId }: TaskEntity) {
    console.log(projectId)
    return this.projectsService.findById(projectId)
  }
}
