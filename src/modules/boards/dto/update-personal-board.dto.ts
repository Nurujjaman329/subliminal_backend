import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePersonalBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
