import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth'
import { ProjectsModule } from '../projects'
import { UsersModule } from '../users'
import TaskEntity from './task.entity'
import TasksResolver from './tasks.resolver'
import TasksService from './tasks.service'

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), AuthModule, UsersModule, ProjectsModule],
  providers: [TasksResolver, TasksService],
})
export default class TasksModule {}
