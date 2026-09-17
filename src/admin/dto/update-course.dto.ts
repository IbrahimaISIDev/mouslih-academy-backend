import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min, ValidateIf, ValidateNested } from 'class-validator';

class LocaleTranslationInputDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class TranslationsInputDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleTranslationInputDto)
  fr?: LocaleTranslationInputDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleTranslationInputDto)
  en?: LocaleTranslationInputDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleTranslationInputDto)
  ar?: LocaleTranslationInputDto;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsInt()
  @Min(0)
  priceXof?: number;

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsInt()
  @Min(0)
  compareAtPriceXof?: number | null;

  @IsOptional()
  @IsBoolean()
  hasCertificate?: boolean;

  @IsOptional()
  @IsBoolean()
  hasVoiceCorrection?: boolean;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslationsInputDto)
  translations?: TranslationsInputDto;
}
