const wrench = require('wrench');
const fs = require('fs');

fs.copyFileSync('./README.md', './dist/groot-ag-grid/README.md');
wrench.copyDirSyncRecursive('./projects/groot-ag-grid/src/style', './dist/groot-ag-grid/style', {
  forceDelete: true
});

console.log('Asset files successfully copied!');
