import {LoadingFailed, PaginatedResponse} from '@listgroup/groot';

export interface NoGridDataMessage {
  message: string;
  style: 'info' | 'warning' | 'danger';
}

export function isNoGridDataMessage<T>(t: PaginatedResponse<T> | NoGridDataMessage | LoadingFailed): t is NoGridDataMessage {
  return t?.hasOwnProperty('message') && t?.hasOwnProperty('style');
}
