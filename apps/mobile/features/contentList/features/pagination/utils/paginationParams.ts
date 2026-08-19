export const paginationOffset = (page: number, pageSize: number) =>
  Math.max(0, (page - 1) * pageSize);

export const paginationPageCount = (totalCount: number, pageSize: number) =>
  Math.max(1, Math.ceil(totalCount / pageSize));

export const clampPage = (page: number, pageCount: number) =>
  Math.min(Math.max(1, page), pageCount);
