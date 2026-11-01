import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateBoardImageDto {
  /** Required when no multipart file is uploaded */
  @ValidateIf((o: CreateBoardImageDto) => !!o.url?.trim())
  @IsString()
  @MinLength(1)
  @IsUrl({ require_tld: false })
  url?: string;

  @IsOptional()
  @IsString()
  thumbUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
