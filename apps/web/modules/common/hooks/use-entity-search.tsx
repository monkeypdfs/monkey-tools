"use client";

import { useEffect, useState } from "react";
import { PAGINATION } from "@/modules/common/constants";

type ExtendedParams = {
  search: string;
  page: number;
};

interface EntitySearchProps<T extends ExtendedParams> {
  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;
}

export const useEntitySearch = <T extends ExtendedParams>({ params, setParams, debounceMs = 500 }: EntitySearchProps<T>) => {
  const [localSearch, setLocalSearch] = useState(params.search);

  useEffect(() => {
    if (localSearch === "" && params.search !== "") {
      setParams({ ...params, search: "", page: PAGINATION.DEFAULT_PAGE });
      return;
    }
    const timer = setTimeout(() => {
      if (localSearch !== params.search)
        setParams({
          ...params,
          search: localSearch,
          page: PAGINATION.DEFAULT_PAGE,
        });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, params, setParams, debounceMs]);

  useEffect(() => {
    setLocalSearch(params.search);
  }, [params.search]);

  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  };
};
