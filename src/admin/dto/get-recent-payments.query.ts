import { IsIn } from 'class-validator';

export class GetRecentPaymentsQuery {
  @IsIn(['fr', 'en', 'ar'])
  locale!: 'fr' | 'en' | 'ar';
}
