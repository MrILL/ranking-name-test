import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { RankedNamesModule } from './ranked-names/ranked-name.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          type: configService.get('DB_TYPE'),
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [
            configService.get('NODE_ENV') === 'production'
              ? 'dist/**/*.entity.js'
              : join(process.cwd(), '**/**.entity.{js,ts}'),
          ],
          ssl: false,
        } as TypeOrmModuleAsyncOptions),
    }),
    RankedNamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
