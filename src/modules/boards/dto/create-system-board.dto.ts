import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSystemBoardDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}
