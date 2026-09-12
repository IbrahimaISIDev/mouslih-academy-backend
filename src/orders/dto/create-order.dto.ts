import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  courseId!: string;

  /**
   * Accepté pour rester compatible avec le contrat existant (createOrder(courseId, userId,
   * amountXof) côté frontend), mais ignoré côté serveur : l'utilisateur vient du token JWT, pas
   * d'un champ fourni par le client (qui pourrait usurper l'identité d'un autre apprenant).
   */
  @IsString()
  userId!: string;

  @IsInt()
  @IsPositive()
  amountXof!: number;
}
