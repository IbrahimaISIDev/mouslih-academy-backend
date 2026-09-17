import { IsString, MinLength } from 'class-validator';

export class UpdateLessonDto {
  @IsString()
  @MinLength(1)
  title!: string;
}
