import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListAdminUsersQuery {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['all', 'withPurchase', 'withoutPurchase'])
  filter: 'all' | 'withPurchase' | 'withoutPurchase' = 'all';

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;
}
