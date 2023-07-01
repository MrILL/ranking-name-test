import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { RankedName } from './ranked-name.entity';
// TODO add barrel to dtos
import { MutateRankedNameDto } from './dtos/mutate-ranked-name.dto';
import { FindOneRankedNameDto } from './dtos/find-one-ranked-name.dto';

@Injectable()
export class RankedNamesService {
  constructor(
    @InjectRepository(RankedName)
    private readonly rankedNameRepository: Repository<RankedName>,
  ) {}

  async getAllRaw(): Promise<RankedName[]> {
    const rankedNames = await this.rankedNameRepository.find();
    if (!rankedNames.length) {
      throw new NotFoundException('Ranked names not found');
    }

    return rankedNames;
  }

  async findOne({ name }: FindOneRankedNameDto): Promise<RankedName> {
    const rankedName = await this.rankedNameRepository.findOneBy({ name });
    if (!rankedName) {
      throw new NotFoundException('Cannot find prev');
    }

    return rankedName;
  }

  private async isReferenceExist(rankedName: string): Promise<boolean> {
    const check = await this.rankedNameRepository.findOneBy({
      name: rankedName,
    });

    return !!check;
  }

  async add(addRankedNameDto: MutateRankedNameDto) {
    // TODO validate prev and next
    const errors = [];

    const { name, prev, next } = addRankedNameDto;

    if (prev && !this.isReferenceExist(prev)) {
      errors.push(`Prev ranked name ${prev} is not exists`);
    }

    if (next) {
      if (!this.isReferenceExist(next)) {
        errors.push(`Next ranked name ${next} is not exists`);
      }

      const checkUniqueNext = await this.rankedNameRepository.findOneBy({
        next,
      });
      if (checkUniqueNext) {
        errors.push(
          `Ranked name ${checkUniqueNext.name} already refering to ${next} as next`,
        );
      }
    }

    if (prev) {
      const prevRankedName = await this.rankedNameRepository.findOneBy({
        name: prev,
      });
      if (next) {
        if (prevRankedName.next !== next) {
          throw new InternalServerErrorException(
            'unexcepted case. This code should not be reachable besause of next is unique',
          );
        }
      } else {
        if (prevRankedName.next) {
          errors.push(
            `Can't push ${name} in the end of linked list because of ${prevRankedName.name} already refering as next to ${prevRankedName.next}`,
          );
        }
      }
    }

    if (name && this.isReferenceExist(name)) {
      errors.push(`Ranked name ${name} already exists`);
    }

    if (errors.length) {
      throw new BadRequestException({
        errors,
      });
    }

    ///
  }
}
