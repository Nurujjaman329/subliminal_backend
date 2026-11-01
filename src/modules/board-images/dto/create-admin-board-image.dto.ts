import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAdminBoardImageDto {
  /** Remote image URL when not uploading a file */
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  @IsInt()
  @Min(0)
  order?: number;
}
