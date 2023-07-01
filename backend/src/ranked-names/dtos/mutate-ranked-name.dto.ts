import { IsNotEmpty, IsOptional } from 'class-validator';

export class MutateRankedNameDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  prev?: string;

  @IsOptional()
  next?: string;
}
