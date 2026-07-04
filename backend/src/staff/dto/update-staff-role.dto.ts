import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../generated/prisma/client.js';

export class UpdateStaffRoleDto {
  @IsEnum(['MANAGER', 'TRAINER'])
  @IsNotEmpty()
  role: 'MANAGER' | 'TRAINER';
}
