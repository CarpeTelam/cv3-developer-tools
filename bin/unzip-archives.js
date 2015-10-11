#!/usr/bin/env node

'use strict';

const fs = require('fs');
const glob = require('glob');
const moment = require('moment');
const unzip = require('unzip');

const timestamp = moment().unix();

let store = require('../store');

const processZip = (src, dest) => {
  const getModified = (name) => {
    return {
      name,
      time: moment(fs.statSync(name).mtime).unix()
    };
  };
  const sortModified = (a, b) => a.time - b.time;
  const unzipFile = (file) => {
    fs.createReadStream(file.name).pipe(unzip.Extract({ path: dest }));
    file.unzipped = moment().unix();
    return file;
  };
  glob(src + '*.zip', null, (error, files) => {
    files = files.map(getModified).sort(sortModified).map(unzipFile);
  });
}

processZip('./process/store/', './store/');
processZip('./process/bootstrap/', './process/bootstrap/bootstrap');

store.lastUpdate = parseInt(timestamp);

const writeFile = (path, json) => {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(path + ' updated.');
  fs.stat(path, (err, stats) => {
    fs.writeFile(path, content, callback);
  });
};

writeFile('./store.json', store);
