export interface TreeTableBase {
  _treeMetadata?: {
    parentId?: string | null;
    id?: string;
    level?: number;
    expanded?: boolean;
    dataPath?: string[];
  };
}

export type TreeTableWithExtras<T> = TreeTableBase & T & {
  _children?: TreeTableWithExtras<T>[];
};
