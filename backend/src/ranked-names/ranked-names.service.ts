import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { RankedName } from './ranked-name.entity';
import { MutateRankedNameDto, GetAllRankedNames } from './dtos';

@Injectable()
export class RankedNamesService {
  logger = new Logger(RankedNamesService.name);

  constructor(
    @InjectRepository(RankedName)
    private readonly rankedNameRepository: Repository<RankedName>,
    private dataSource: DataSource,
  ) {}

  private async validateAdd({
    prev,
    next,
    name,
  }: MutateRankedNameDto): Promise<string[]> {
    const relatedEntityPromises = [prev, next].map(
      (name) => name && this.rankedNameRepository.findOneBy({ name }),
    );
    const [prevRankedName, nextRankedName]: RankedName[] = await Promise.all(
      relatedEntityPromises,
    );

    const errors = [];

    if (prev && !prevRankedName) {
      errors.push(`Prev ranked name ${prev} is not exists`);
    }

    if (next && !nextRankedName) {
      errors.push(`Next ranked name ${next} is not exists`);
    }

    if (errors.length) {
      return errors;
    }

    if (prev && next && prevRankedName.next !== next) {
      errors.push(
        `Prev ranked name ${prev} is not referencing ${next} as next. It violate adding items in the middle of linked list`,
      );
    }

    if (prev && !next && prevRankedName.next) {
      errors.push(
        `Can't push ${name} in the end of linked list because of ${prevRankedName.name} already refering as next to ${prevRankedName.next}`,
      );
    }

    return errors;
  }

  private async _add(
    { name, prev, next }: MutateRankedNameDto,
    id?: number,
  ): Promise<RankedName> {
    const checkUnique = await this.rankedNameRepository.findOneBy({ name });
    if (checkUnique) {
      throw new BadRequestException(`Ranked name ${name} already exists`);
    }

    const errors = await this.validateAdd({ name, prev, next });
    if (errors.length) {
      throw new BadRequestException({
        errors,
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let res;

    try {
      if (prev) {
        const prevRankedName = await this.rankedNameRepository.findOneBy({
          name: prev,
        });
        prevRankedName.next = name;
        await this.rankedNameRepository.save(prevRankedName);
      }

      const newRankedName: RankedName = Object.assign(new RankedName(), {
        id,
        name,
        next,
      });
      res = await this.rankedNameRepository.save(newRankedName);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    return res;
  }

  async getAll({
    limit = 100,
    order = 'ASC',
    startId,
  }: GetAllRankedNames = {}): Promise<RankedName[]> {
    if (!startId) {
      const first = await this.rankedNameRepository.findOneBy({
        next: IsNull(),
      });
      if (!first) {
        throw new NotFoundException('Ranked names not found');
      }
      startId = first.id;
    }

    const rawQuery = `
    WITH RECURSIVE linked_list AS (
      SELECT id, name, next
      FROM ranked_name
      WHERE id = ${startId}
      UNION ALL
      SELECT t.id, t.name, t.next
      FROM ranked_name t
      ${
        order === 'ASC'
          ? 'JOIN linked_list ll ON t.next = ll.name'
          : 'JOIN linked_list ll ON t.name = ll.next'
      }
    )
    SELECT *
    FROM linked_list
    LIMIT ${limit};`;

    const rankedNames: RankedName[] = await this.rankedNameRepository.query(
      rawQuery,
    );
    if (!rankedNames.length) {
      throw new NotFoundException('Ranked names not found');
    }

    this.logger.log(`Fetched ${rankedNames.length} Ranked names`);
    this.logger.debug(rankedNames);

    return order === 'DESC' ? rankedNames : rankedNames.reverse();
  }

  async add(payload: MutateRankedNameDto): Promise<RankedName> {
    return this._add(payload);
  }

  async update(
    id: number,
    { prev, next, name }: MutateRankedNameDto,
  ): Promise<RankedName> {
    const oldRankedName = await this.rankedNameRepository.findOneBy({
      id,
    });
    if (!oldRankedName) {
      throw new NotFoundException(`Ranked name id:${id} is not exists`);
    }

    const prevRankedName = await this.rankedNameRepository.findOneBy({
      next: name,
    });
    if (
      prevRankedName &&
      prevRankedName.name === prev &&
      oldRankedName.next === next
    ) {
      // TODO do nothing if it's have the save place
      if (oldRankedName.name === name) {
        return oldRankedName;
      } else {
        return this.rename(id, name);
      }
    }

    const insertErrors = await this.validateAdd({ prev, next, name });
    if (insertErrors.length) {
      this.logger.error(insertErrors);
      throw new BadRequestException(insertErrors);
    }

    let res: RankedName;

    try {
      await this.remove(id);
      res = await this._add({ prev, next, name }, id);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return res;
  }

  async rename(id: number, newName: string): Promise<RankedName> {
    const rankedName = await this.rankedNameRepository.findOneBy({ id });
    if (!rankedName) {
      throw new NotFoundException(`Ranked name id:${id} is not exists`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let res;

    try {
      const prevRankedName = await this.rankedNameRepository.findOneBy({
        next: rankedName.name,
      });
      if (prevRankedName) {
        prevRankedName.next = newName;
        await this.rankedNameRepository.save(prevRankedName);
      }

      rankedName.name = newName;
      res = await this.rankedNameRepository.save(rankedName);

      await queryRunner.commitTransaction();
      this.logger.log(`Rename id:${id} to ${newName}`);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    return res;
  }

  async remove(id: number): Promise<RankedName> {
    const currentRankedName = await this.rankedNameRepository.findOneBy({
      id,
    });
    if (!currentRankedName) {
      throw new NotFoundException(`Ranked name id:${id} is not exists`);
    }

    const prevRankedName = await this.rankedNameRepository.findOneBy({
      next: currentRankedName.name,
    });

    await this.rankedNameRepository.remove(currentRankedName);

    if (prevRankedName) {
      prevRankedName.next = currentRankedName.next;
      await this.rankedNameRepository.save(prevRankedName);
    }

    return currentRankedName;
  }
}
