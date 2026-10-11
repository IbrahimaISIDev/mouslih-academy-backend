import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, MinLength, ValidateIf } from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  /** Lien ou identifiant YouTube (voir parseYouTubeVideoId) ; `null` retire la vidéo. */
  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsString()
  youtubeUrl?: string | null;

  /** Saisie manuelle : la durée d'une vidéo YouTube n'est pas lisible sans clé d'API Google. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6 * 60 * 60)
  durationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  isFreePreview?: boolean;
}
