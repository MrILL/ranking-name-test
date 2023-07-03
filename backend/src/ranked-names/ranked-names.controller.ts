import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RankedName } from './ranked-name.entity';
import { RankedNamesService } from './ranked-names.service';
import { MutateRankedNameDto } from './dtos/mutate-ranked-name.dto';
import { GetAllRankedNames } from './dtos/get-all-ranked-names.dto';

@Controller('ranked-names')
export class RankedNamesController {
  constructor(private readonly rankedNamesService: RankedNamesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() queries: GetAllRankedNames): Promise<RankedName[]> {
    return this.rankedNamesService.getAll(queries);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@Body() payload: MutateRankedNameDto): Promise<RankedName> {
    return this.rankedNamesService.add(payload);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: number,
    @Body() payload: MutateRankedNameDto,
  ): Promise<void> {
    await this.rankedNamesService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    await this.rankedNamesService.remove(id);
  }
}
