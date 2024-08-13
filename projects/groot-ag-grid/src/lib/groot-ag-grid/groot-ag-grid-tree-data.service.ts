import {Injectable} from '@angular/core';
import {GetDataPath, GetRowIdFunc, GridApi, GridOptions} from 'ag-grid-community';
import {TreeTableWithExtras} from './groot-ag-grid-tree-data.model';

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
                            gridOptions?: GridOptions): TreeTableWithExtras<T>[] {
    const recordMap: { [key: string]: TreeTableWithExtras<T> } = {};
    const dataPathToRowId = {};
    const tree: TreeTableWithExtras<T>[] = [];
    const missingNodes: string[] = [];

    // if gridReady
    if (api) {
      // retrieve id and store in recordMap
      rows?.forEach((val: TreeTableWithExtras<T>) => {
        const treeNode: TreeTableWithExtras<T> = {...val, _treeMetadata: {}};
        treeNode._treeMetadata.id = (getRowId && gridOptions) ?
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

        if (getDataPath) {
          const dataPath = getDataPath(treeNode);
          dataPathToRowId[dataPath.join('|')] = treeNode._treeMetadata.id;
          treeNode._treeMetadata.parentId = null;
          treeNode._treeMetadata.dataPath = dataPath;
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

      // check if there are missing elements in the tree structure
      // if missing nodes are found, they are added and their rowId is built using getDataPath
      Object.entries(recordMap).forEach(([key, element]) => {
        if (getDataPath) {
          const concatenatedPaths = element._treeMetadata.dataPath.reduce((acc, curr, index) => {
            if (index === 0) {
              acc.push(curr);
            } else {
              acc.push(`${acc[index - 1]}|${curr}`);
            }
            return acc;
          }, [] as string[]);
          concatenatedPaths.forEach((path, index) => {
            if (!dataPathToRowId[path]) {
              dataPathToRowId[path] = path;
              // @ts-ignore
              recordMap[path] = {
                rowId: path,
                _treeMetadata: {
                  id: path,
                  dataPath: path.split('|'),
                  expanded: nodeExpandedStatus.get(path) ?? false,
                  level: index,
                },
                _children: []
              };
              missingNodes.push(path);
              if (index === 0) {
                tree.push(recordMap[path]);
              }
            }
          });
        }
      });

      // identify parent-child relationship
      Object.keys(recordMap).forEach(key => {
        const element = recordMap[key];
        if (getDataPath) {
          if (element._treeMetadata.dataPath?.length > 1) {
            const parentDataPath = element._treeMetadata.dataPath.slice(0, -1).join('|');
            if (dataPathToRowId[parentDataPath]) {
              element._treeMetadata.parentId = dataPathToRowId[parentDataPath];
            }
          }
        }
        if (element._treeMetadata.parentId === null) {
          tree.push(recordMap[key]);
        } else {
          if (recordMap[element._treeMetadata.parentId] && recordMap[element._treeMetadata.id]) {
            recordMap[element._treeMetadata.parentId]._children.push(recordMap[element._treeMetadata.id]);
          }
        }
      });

      // perform data aggregation of columns with aggFunc = sum
      // tslint:disable-next-line:no-string-literal
      const toBeAggregated = api.getColumnDefs()?.filter(colDef => colDef['aggFunc'])
        // tslint:disable-next-line:no-string-literal
        .map(colDef => ({field: colDef['field'], aggFunc: colDef['aggFunc']}));

      missingNodes?.sort((a, b) => b.length - a.length).forEach(nodeId => {
        const node = recordMap[nodeId];
        toBeAggregated?.forEach(el => {
          if (el.aggFunc === 'sum' && node._children.length !== 0) {
            const acc = node._children.reduce((acc, cur) => {
              return cur[el.field] ? acc + cur[el.field] : acc;
            }, null);
            recordMap[nodeId][el.field] = acc === null ? null : acc;
          }
        });
      });


      tree.forEach(root => this.assignLevels(root, 0));
    }
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
                           nodeExpandedStatus?: Map<string, boolean>,
                           level: number = undefined): TreeTableWithExtras<T>[] {
    dataArray.forEach(row => {
      if (level === undefined || row._treeMetadata.level < level) {
        if (row._children) {
          nodeExpandedStatus?.set(row._treeMetadata.id, expand);
          row._treeMetadata.expanded = expand;
          row._children = this.manageRecursiveExpansion(row._children, expand, nodeExpandedStatus, level);
        }
      }
    });
    return dataArray;
  }

}
