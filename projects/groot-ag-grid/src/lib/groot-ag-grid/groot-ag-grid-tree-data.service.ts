import {Injectable} from '@angular/core';
import {GetDataPath, GetRowIdFunc, GridApi, GridOptions} from 'ag-grid-community';

interface TreeTableBase {
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

@Injectable({
  providedIn: 'root'
})
export class GrootAgGridTreeDataService<T> {

  constructor() {
  }

  generateTreeFromPlainRows(rows: TreeTableWithExtras<T>[],
                            getRowId?: GetRowIdFunc,
                            getDataPath?: GetDataPath,
                            nodeExpandedStatus?: Map<string, boolean>,
                            api?: GridApi,
                            gridOptions?: GridOptions): TreeTableWithExtras<T>[]{
    const recordMap: { [key: string]: TreeTableWithExtras<T> } = {};
    const dataPathToRowId = {};
    const tree: TreeTableWithExtras<T>[] = [];

    // retrieve id and store in recordMap
    rows?.forEach((val: TreeTableWithExtras<T>) => {
      const treeNode: TreeTableWithExtras<T> = {...val, _treeMetadata: {}};
      treeNode._treeMetadata.id = (getRowId && api && gridOptions) ?
        getRowId({
          api,
          columnApi: undefined,
          context: gridOptions.context,
          level: 0,
          data: treeNode
        }) : (treeNode.hasOwnProperty('id') ? (treeNode as any).id : undefined);

      if (treeNode._treeMetadata.id === undefined) {
        console.error('Row ID undefined. You must provide [getRowId] or an \'id\' property in the data object');
      }

      recordMap[treeNode._treeMetadata.id] = {
        ...treeNode,
        _treeMetadata: {
          ...treeNode._treeMetadata,
          expanded: nodeExpandedStatus.get(treeNode._treeMetadata.id) ?? (treeNode._treeMetadata.expanded || false)
        },
        _children: []
      };
    });

    // identify parent-child relationship
    Object.entries(recordMap).forEach(([key, element]) => {
      if (getDataPath) {
        const dataPath = getDataPath(element);
        dataPathToRowId[dataPath.join('@#$')] = element._treeMetadata.id;
        element._treeMetadata.parentId = null;
        element._treeMetadata.dataPath = dataPath;
        if (dataPath?.length > 1) {
          const parentDataPath = dataPath.slice(0, -1).join('@#$');
          if (dataPathToRowId[parentDataPath]) {
            element._treeMetadata.parentId = dataPathToRowId[parentDataPath];
          }
        }
      }

      if (element._treeMetadata.parentId === null) {
        tree.push(recordMap[key]);
      } else {
        if (recordMap[element._treeMetadata.parentId]) {
          recordMap[element._treeMetadata.parentId]._children.push({
            ...recordMap[element._treeMetadata.id],
            parentId: element._treeMetadata.parentId,
            dataPath: element._treeMetadata.dataPath ?? element._treeMetadata.dataPath
          });
        }
      }
    });

    tree.forEach(root => this.assignLevels(root, 0));
    return [...tree];
  }

  expandRow(row: TreeTableWithExtras<T>, currentTree: TreeTableWithExtras<T>[], nodeExpandedStatus?: Map<string, boolean>): TreeTableWithExtras<T>[] {
    const elementToExpandIndex = currentTree.findIndex(el => el._treeMetadata.id === row._treeMetadata.id);
    if (elementToExpandIndex !== -1) {
      const rowData = [...currentTree];
      rowData[elementToExpandIndex]._treeMetadata.expanded = true;
      nodeExpandedStatus?.set(row._treeMetadata.id, true);
      rowData.splice(elementToExpandIndex + 1, 0, ...row._children);
      return rowData;
    }
    return null;
  }

  collapseRow(row: TreeTableWithExtras<T>, currentTree: TreeTableWithExtras<T>[], nodeExpandedStatus?: Map<string, boolean>): TreeTableWithExtras<T>[] {
    const elementToCollapseIndex = currentTree.findIndex(el => el._treeMetadata.id === row._treeMetadata.id);
    if (elementToCollapseIndex !== -1) {
      const rowData = [...currentTree];
      rowData[elementToCollapseIndex]._treeMetadata.expanded = false;
      nodeExpandedStatus?.set(row._treeMetadata.id, false);
      const nestedChildren = this.collectNestedChildren(row);
      nestedChildren.forEach(child => {
        const index = rowData.findIndex(el => el._treeMetadata.id === child._treeMetadata.id);
        if (index !== -1) {
          nodeExpandedStatus?.set(row._treeMetadata.id, false);
          child._treeMetadata.expanded = false;
          rowData.splice(index, 1);
        }
      });
      return rowData;
    }
    return null;
  }

  private collectNestedChildren(row: TreeTableWithExtras<T>): TreeTableWithExtras<T>[] {
    let nestedChildren: TreeTableWithExtras<T>[] = [];
    if (row._children) {
      row._children.forEach(child => {
        nestedChildren.push(child);
        nestedChildren = nestedChildren.concat(this.collectNestedChildren(child));
      });
    }
    return nestedChildren;
  }

  private assignLevels(node: TreeTableWithExtras<T>, level: number): void {
    node._treeMetadata.level = node._treeMetadata.level ? node._treeMetadata.level : level;
    node._children.forEach(childNode => this.assignLevels(childNode, level + 1));
  }

  manageRecursiveExpansion(dataArray: TreeTableWithExtras<T>[],
                           expand: boolean,
                           level: number = undefined,
                           nodeExpandedStatus?: Map<string, boolean>): TreeTableWithExtras<T>[] {
    dataArray.forEach(row => {
      if (level === undefined || row._treeMetadata.level < level) {
        if (row._children) {
          nodeExpandedStatus?.set(row._treeMetadata.id, expand);
          row._treeMetadata.expanded = expand;
          row._children = this.manageRecursiveExpansion(row._children, expand, level);
        }
      }
    });
    return dataArray;
  }

}
