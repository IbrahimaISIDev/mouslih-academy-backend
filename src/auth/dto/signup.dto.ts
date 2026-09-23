import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

// E.164 format: +[country code][number] - starts with +, followed by 10-15 digits
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

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
  @Matches(E164_REGEX, { message: 'Format de numéro invalide (ex: +221771234567)' })
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  /** Consentement tracé côté frontend, non persisté ici. */
  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}
