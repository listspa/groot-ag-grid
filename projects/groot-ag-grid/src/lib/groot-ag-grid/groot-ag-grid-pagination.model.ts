import {PaginationOptions, SortPagination} from "@listgroup/groot";

export interface MultipleSortPagination {
  sort: SortPagination[]
}

export interface MultiSortPaginationOptions extends PaginationOptions, MultipleSortPagination {
}
