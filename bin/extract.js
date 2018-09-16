const fs = require('fs');
const glob = require('glob');
const moment = require('moment');
const extract = require('extract-zip');

const baseDir = process.cwd();

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
        (error) => error ? console.log(error) : console.log(`${file.name.replace(baseDir, '.')} extracted`)
      );
      const extracted = moment().unix();
      return { ...file, extracted };
    });
  });
}

function writeFile (path, json) {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(`${path.replace(baseDir, '.')} updated`);
  fs.stat(path, (err, stats) => {
    fs.writeFile(path, content, callback);
  });
}

(() => {

  const timestamp = parseInt(moment().unix());
  const storePath = `${baseDir}/store.json`;
  const store = fs.existsSync(storePath) ? require(storePath) : false;
  
  if (!store) {
    console.log('Please run `npm run setup` to create the proper config files.');
    process.exit();
  }

  processFiles(`${baseDir}/extract/store`, `${baseDir}/store`);
  processFiles(`${baseDir}/extract/bootstrap`, `${baseDir}/extract/bootstrap/bootstrap`);
  
  writeFile(`${baseDir}/store.json`, { ...store, timestamp });

})();
