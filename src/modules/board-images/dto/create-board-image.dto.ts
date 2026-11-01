import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateBoardImageDto {
  @IsString()
  @IsUrl({ require_tld: false })
  url!: string;

  @IsOptional()
  @IsString()
  thumbUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
