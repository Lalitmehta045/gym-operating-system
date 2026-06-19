import { SubscriptionDto } from './subscription.dto.js';

export interface PaginatedSubscriptionsDto {
  data: SubscriptionDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
