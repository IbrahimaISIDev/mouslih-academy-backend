import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

const SENEGAL_PHONE_REGEX = /^(77|78|76|70)\d{7}$/;

export class SignupDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(SENEGAL_PHONE_REGEX, { message: 'Numéro sénégalais attendu (77, 78, 76, 70)' })
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  /** Consentement tracé côté frontend, non persisté ici. */
  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}
