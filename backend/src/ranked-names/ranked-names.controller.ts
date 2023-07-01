import { Controller, Get } from '@nestjs/common';
import { RankedName } from './ranked-name.entity';
import { RankedNamesService } from './ranked-names.service';

@Controller('ranked-names')
export class RankedNamesController {
  constructor(private readonly rankedNamesService: RankedNamesService) {}

  // TODO get all
  @Get()
  async getAll(): Promise<RankedName[]> {
    return this.rankedNamesService.getAllRaw();
  }

  // TODO create
  // TODO update
  // TODO delete
}
