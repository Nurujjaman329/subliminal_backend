import { IsOptional, IsString } from 'class-validator';

export class SetMeditationMediaDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
