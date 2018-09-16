const fs = require('fs');
const openBrowser = require('react-dev-utils/openBrowser');

const baseDir = process.cwd();
const storePath = `${baseDir}/store.json`;
const store = fs.existsSync(storePath) ? require(storePath) : false;

if (!store || store.stagingURL === '') {
  console.log('Please run `npm run setup` to create the proper config files.');
  process.exit(1);
}

openBrowser(store.stagingURL);
