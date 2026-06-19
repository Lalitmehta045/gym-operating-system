import { PaymentDto } from './payment.dto.js';

export interface PaginatedPaymentsDto {
  data: PaymentDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
