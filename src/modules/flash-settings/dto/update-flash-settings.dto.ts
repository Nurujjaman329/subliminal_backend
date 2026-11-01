import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class FlashOptionDto {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  @MinLength(1)
  value!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsNumber()
  ms?: number;

  @IsOptional()
  @IsNumber()
  seconds?: number | null;

  @IsOptional()
  @IsString()
  mediaUrl?: string | null;
}

export class FlashGroupPatchDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlashOptionDto)
  options?: FlashOptionDto[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  defaultValue?: string;
}

/** Admin UI flat defaults map (audio → audioOptions) */
export class FlashDefaultsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  position?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  showEvery?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  imageSize?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  sessionLength?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  audio?: string;
}

export class RunOnStartUpPatchDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;
}

export class UpdateFlashSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FlashDefaultsDto)
  defaults?: FlashDefaultsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlashGroupPatchDto)
  position?: FlashGroupPatchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlashGroupPatchDto)
  showEvery?: FlashGroupPatchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlashGroupPatchDto)
  imageSize?: FlashGroupPatchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlashGroupPatchDto)
  sessionLength?: FlashGroupPatchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlashGroupPatchDto)
  audioOptions?: FlashGroupPatchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RunOnStartUpPatchDto)
  runOnStartUp?: RunOnStartUpPatchDto;
}
