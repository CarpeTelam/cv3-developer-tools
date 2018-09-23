const fs = require('fs');
const glob = require('glob');
const moment = require('moment');
const extract = require('extract-zip');

const baseDir = process.cwd();
const storePath = `${baseDir}/store.json`;
const store = fs.existsSync(storePath) ? require(storePath) : false;

if (!store) {
  console.log('Please run `npm run setup` to create the proper config files.');
  process.exit();
}

function getModified (name) {
  const time = moment(fs.statSync(name).mtime).unix();
  return { name, time };
}

function sortModified (a, b) {
  return a.time - b.time;
}

function writeFile (path, json) {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(`${path.replace(baseDir, '.')} updated`);
  fs.stat(path, (err, stats) => {
    fs.writeFile(path, content, callback);
  });
}

function processFiles (src, dest) {  
  glob(`${src}/*.zip`, null, (error, files) => {
    files = files.map(getModified).sort(sortModified).map((file) => {
      extract(
        file.name,
        { dir: dest },
        (error) => {
          if (error) {
            console.log(error)
            return;
          }
          const timestamp = parseInt(moment().unix());
          console.log(`${file.name.replace(baseDir, '.')} extracted`);
          writeFile(`${baseDir}/store.json`, { ...store, timestamp });
        }
      );
    });
  });
}

(() => {

  processFiles(`${baseDir}/extract/store`, `${baseDir}/store`);
  processFiles(`${baseDir}/extract/bootstrap`, `${baseDir}/extract/bootstrap/bootstrap`);

})();
