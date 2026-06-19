import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateTenantOrderDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;
}
