import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth'
import { ProjectsModule } from '../projects'
import { UsersModule } from '../users'
import SprintToUserEntity from './sprint-to-user.entity'
import SprintEntity from './sprint.entity'
import SprintsResolver from './sprints.resolver'
import SprintsService from './sprints.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([SprintEntity, SprintToUserEntity]),
    AuthModule,
    UsersModule,
    ProjectsModule,
  ],
  providers: [SprintsResolver, SprintsService],
  exports: [SprintsResolver],
})
export default class SprintsModule {}
