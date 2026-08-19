export type PageSize = 10 | 25 | 50 | 100;

export type PaginationState = {
  page: number;
  pageSize: PageSize;
};

export type PaginatedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: PageSize;
  pageCount: number;
};
