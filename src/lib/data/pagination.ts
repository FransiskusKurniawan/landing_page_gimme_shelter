export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

interface PaginationConfig {
  defaultPage: number;
  defaultLimit: number;
  pageSizeOptions: number[];
  maxLimit: number;
  minLimit: number;
}

export const createPaginationService = (config: PaginationConfig) => {
  const {
    defaultPage,
    defaultLimit,
    pageSizeOptions,
    maxLimit,
    minLimit,
  } = config;

  const getPaginationInfo = (info: PaginationInfo): string => {
    if (info.total === 0) {
      return 'No results found';
    }
    return `Showing ${info.startIndex} to ${info.endIndex} of ${info.total} results`;
  };

  const getPageNumbers = (info: PaginationInfo): (number | 'ellipsis')[] => {
    const { page, totalPages } = info;
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getPageSizeOptions = () => {
    return pageSizeOptions.map((size) => ({
      label: `${size} per page`,
      value: size,
    }));
  };

  const validatePageSize = (size: number): number => {
    if (size < minLimit) return minLimit;
    if (size > maxLimit) return maxLimit;
    return size;
  };

  return {
    getPaginationInfo,
    getPageNumbers,
    getPageSizeOptions,
    validatePageSize,
    defaultPage,
    defaultLimit,
  };
};
