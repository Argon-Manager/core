import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth'
import { UsersModule } from '../users'
import TaskToAssignedEntity from './task-to-assigned.entity'
import TaskEntity from './task.entity'
import TasksResolver from './tasks.resolver'
import TasksService from './tasks.service'

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskToAssignedEntity]), AuthModule, UsersModule],
  providers: [TasksService, TasksResolver],
})
export default class TasksModule {}
