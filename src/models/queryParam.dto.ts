import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { unknownToNumber } from '~/transforms/value.transform';

export class QueryParam {
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => unknownToNumber(value))
  @IsOptional()
  @IsNotEmpty()
  current?: number;
  @IsNumber()
  @Max(50)
  @Transform(({ value }) => unknownToNumber(value))
  @IsOptional()
  @IsNotEmpty()
  pageSize?: number;
}
