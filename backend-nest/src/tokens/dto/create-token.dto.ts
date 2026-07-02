import { Exclude, Expose } from 'class-transformer';
import { IsJWT, IsUUID } from 'class-validator';

@Exclude()
export class CreateTokenDto {
  @Expose()
  @IsJWT()
  refreshToken!: string;

  @Expose()
  @IsUUID('4')
  userId!: string;
}
