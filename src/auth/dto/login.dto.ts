import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  /** Utilisé côté frontend pour choisir la durée du cookie de session, ignoré par l'API. */
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
