import { Injectable, UseGuards } from '@nestjs/common'
import { Args, Mutation } from '@nestjs/graphql'
import { TaskInput } from '../app/generated'
import { AuthGuard, AuthUser } from '../auth'
import UserEntity from '../users/user.entity'
import TasksService from './tasks.service'

@Injectable()
export default class TasksResolver {
  constructor(private tasksService: TasksService) {}

  @Mutation()
  @UseGuards(AuthGuard)
  async createTask(
    @AuthUser() user: UserEntity,
    @Args('input') { assignedId, ...input }: TaskInput
  ) {
    return this.tasksService.create({
      ...input,
      assignedId: assignedId ? parseInt(assignedId) : null,
    })
  }
}
