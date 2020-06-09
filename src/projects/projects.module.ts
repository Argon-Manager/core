import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth'
import { UsersModule } from '../users'
import ProjectToUserEntity from './project-to-user.entity'
import ProjectEntity from './project.entity'
import ProjectsResolver from './projects.resolver'
import ProjectsService from './projects.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity, ProjectToUserEntity]),
    AuthModule,
    UsersModule,
  ],
  providers: [ProjectsResolver, ProjectsService],
  exports: [ProjectsResolver, ProjectsService],
})
export default class ProjectsModule {}
