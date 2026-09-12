import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListAdminOrdersQuery {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['all', 'paid', 'pending', 'failed'])
  status: 'all' | 'paid' | 'pending' | 'failed' = 'all';

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsIn(['fr', 'en', 'ar'])
  locale!: 'fr' | 'en' | 'ar';
}
