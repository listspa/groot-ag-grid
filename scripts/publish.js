const glob = require('glob');
const spawn = require('child_process').spawn;

const tgz = glob.sync('./dist/groot-ag-grid/listgroup-groot-ag-grid-*.tgz');
if (tgz.length !== 1) {
  throw new Error("Expected to find exactly one tgz file in dist");
}

spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['publish', tgz[0], '--verbose'], {stdio: 'inherit', shell: true});
