import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth'
import { ProjectsModule } from '../projects'
import { SprintsModule } from '../sprints'
import { TasksModule } from '../tasks'
import { UsersModule } from '../users'
import { WorkspacesModule } from '../workspaces'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        path: '/',
        playground: configService.get('NODE_ENV') !== 'production',
        watch: configService.get('NODE_ENV') !== 'production',
        typePaths: ['./**/*.graphql'],
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('PG_URL'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    WorkspacesModule,
    SprintsModule,
  ],
})
export default class AppModule {}
