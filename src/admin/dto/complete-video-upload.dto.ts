import { IsString, MaxLength, MinLength } from 'class-validator';

export class CompleteVideoUploadDto {
  /** public_id renvoyé par Cloudinary à la fin de l'envoi (vérifié côté serveur). */
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  publicId!: string;
}
