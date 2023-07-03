import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RankedNamesController } from './ranked-names.controller';
import { RankedNamesService } from './ranked-names.service';
import { RankedName } from './ranked-name.entity';
import { RankedNamesGateway } from './ranked-name.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([RankedName])],
  providers: [RankedNamesService, RankedNamesGateway],
  controllers: [RankedNamesController],
  exports: [RankedNamesService],
})
export class RankedNamesModule {}
