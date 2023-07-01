import { IsNotEmpty } from 'class-validator';

export class FindOneRankedNameDto {
  @IsNotEmpty()
  name: string;
}
