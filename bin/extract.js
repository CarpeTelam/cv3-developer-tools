const fs = require('fs');
const glob = require('glob');
const moment = require('moment');
const extract = require('extract-zip');

const basePath = process.cwd();

function getModified (name) {
  const time = moment(fs.statSync(name).mtime).unix();
  return { name, time };
}

function sortModified (a, b) {
  return a.time - b.time;
}

function processFiles (src, dest) {  
  glob(`${src}/*.zip`, null, (error, files) => {
    files = files.map(getModified).sort(sortModified).map((file) => {
      extract(
        file.name,
        { dir: dest },
        (error) => error ? console.log(error) : console.log(`${file.name.replace(basePath, '.')} extracted`)
      );
      const extracted = moment().unix();
      return { ...file, extracted };
    });
  });
}

function writeFile (path, json) {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(`${path.replace(basePath, '.')} updated.`);
  fs.stat(path, (err, stats) => {
    fs.writeFile(path, content, callback);
  });
}

(() => {

  const timestamp = parseInt(moment().unix());

  let store;
  
  try {
    store = require(`${basePath}/store.json`);
  } catch (exception) {
    if(exception.code === 'MODULE_NOT_FOUND') {
      console.log('Please run \'npm run setup\' to create a store.json file.');
      process.exit();
    } else {
      console.error(exception);
    }
  }
  
  processFiles(`${basePath}/extract/store`, `${basePath}/store`);
  processFiles(`${basePath}/extract/bootstrap`, `${basePath}/extract/bootstrap/bootstrap`);
  
  writeFile(`${basePath}/store.json`, { ...store, timestamp });

})();
