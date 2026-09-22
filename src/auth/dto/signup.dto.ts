import { IsBoolean, IsEmail, IsOptional, IsString, MinLength, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { parsePhoneNumber } from 'libphonenumber-js';

@ValidatorConstraint({ name: 'isPhoneNumber', async: false })
export class IsPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false;
    try {
      const phoneNumber = parsePhoneNumber(value);
      return phoneNumber && phoneNumber.isValid();
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'Numéro de téléphone invalide';
  }
}

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
  @IsPhoneNumberConstraint()
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  /** Consentement tracé côté frontend, non persisté ici. */
  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}
