import { IsInt, Min } from 'class-validator';

export class SavePositionDto {
  @IsInt()
  @Min(0)
  positionSeconds!: number;
}
