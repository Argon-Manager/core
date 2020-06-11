import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth'
import { ProjectsModule } from '../projects'
import { UsersModule } from '../users'
import WorkspaceToUserEntity from './workspace-to-user.entity'
import WorkspaceEntity from './workspace.entity'
import WorkspacesResolver from './workspaces.resolver'
import WorkspacesService from './workspaces.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, WorkspaceToUserEntity]),
    AuthModule,
    UsersModule,
    ProjectsModule,
  ],
  providers: [WorkspacesResolver, WorkspacesService],
  exports: [WorkspacesResolver],
})
export default class WorkspacesModule {}
