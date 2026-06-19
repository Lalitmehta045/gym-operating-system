import { InvoiceDto } from './invoice.dto.js';

export interface PaginatedInvoicesDto {
  data: InvoiceDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
