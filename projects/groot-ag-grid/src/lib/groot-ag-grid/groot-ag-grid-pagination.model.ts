import {FilterOption, PaginationOptions, SortPagination} from "@listgroup/groot";

export interface MultipleSortPagination {
  sort: SortPagination[]
}

export interface MultiSortPaginationOptions extends PaginationOptions, MultipleSortPagination {
}

export interface MultiSortFilterPaginationOptions extends MultiSortPaginationOptions {
  filters: FilterOption[];
}
