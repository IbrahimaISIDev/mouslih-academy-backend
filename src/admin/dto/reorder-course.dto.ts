import { ArrayNotEmpty, IsIn, IsString, ValidateIf } from 'class-validator';

export class ReorderCourseDto {
  @IsIn(['modules', 'lessons'])
  scope!: 'modules' | 'lessons';

  @ValidateIf((dto: ReorderCourseDto) => dto.scope === 'lessons')
  @IsString()
  subModuleId?: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  orderedIds!: string[];
}
