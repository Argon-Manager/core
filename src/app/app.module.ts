import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { AuthModule } from '../auth'

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        path: "/",
        playground: configService.get('NODE_ENV') !== "production",
        typePaths: ['./**/*.graphql'],
      })
    }),
    ConfigModule.forRoot(),
    AuthModule
  ],
})
export class AppModule {}
