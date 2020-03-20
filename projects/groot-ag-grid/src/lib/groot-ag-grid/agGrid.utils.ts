import {SortPagination} from '@listgroup/groot';

export function toSortModel(p: SortPagination) {
  return [{
    colId: p.sortField,
    sort: p.sortReversed ? 'desc' : 'asc'
  }];
}

export function toSortPagination(sortModel): SortPagination {
  return {
    sortField: sortModel.colId,
    sortReversed: sortModel.sort === 'desc'
  };
}
