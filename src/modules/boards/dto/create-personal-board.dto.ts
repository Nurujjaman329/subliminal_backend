import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePersonalBoardDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}
