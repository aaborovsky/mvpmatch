import { Role } from '../../roles/role.enum';
import { UserId } from '../../users/entities/user.entity';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SessionId } from '../entitites/session.entity';

export class AuthenticatedUserDto {
  @IsNumber()
  @IsNotEmpty()
  id: UserId;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(Role)
  role: Role;

  @IsNumber()
  @IsNotEmpty()
  sessionId: SessionId;
}
