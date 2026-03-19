export interface SearchQuery {
  query: string;
  column: string;
}

interface SearchConfig {
  searchableFields: string[];
  defaultSearchField: string;
  customSearchLogic?: Partial<
    Record<string, (value: unknown, searchTerm: string) => boolean>
  >;
}

export const createSearchService = (config: SearchConfig) => {
  const { searchableFields, defaultSearchField, customSearchLogic = {} } = config;

  const search = <T extends Record<string, unknown>>(
    data: T[],
    searchTerm: string,
    searchColumn: string = 'all'
  ): T[] => {
    if (!searchTerm) return data;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchColumn === 'all') {
        return searchableFields.some((field) => {
          const value = item[field];
          
          if (customSearchLogic[field]) {
            return customSearchLogic[field]!(value, lowerSearchTerm);
          }

          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(lowerSearchTerm);
        });
      } else {
        const value = item[searchColumn];
        
        if (customSearchLogic[searchColumn]) {
          return customSearchLogic[searchColumn]!(value, lowerSearchTerm);
        }

        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerSearchTerm);
      }
    });
  };

  const getConfig = () => config;

  return {
    search,
    getConfig,
  };
};
