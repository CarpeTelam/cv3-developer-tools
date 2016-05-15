#!/usr/bin/env node

'use strict';

const fs = require('fs');
const glob = require('glob');
const moment = require('moment');
const extract = require('extract-zip');

const timestamp = moment().unix();

let store = require('../store');

const process = (src, dest) => {
  const getModified = (name) => {
    return {
      name,
      time: moment(fs.statSync(name).mtime).unix()
    };
  };
  const sortModified = (a, b) => a.time - b.time;
  const extractFiles = (file) => {
    extract(file.name, { dir: dest }, function (error) {
      error ? console.log(error) : console.log(file.name + " extracted");
    });
    file.extracted = moment().unix();
    return file;
  };
  glob(src + '*.zip', null, (error, files) => {
    files = files.map(getModified).sort(sortModified).map(extractFiles);
  });
};

process('./extract/store/', './store/');
process('./extract/bootstrap/', './extract/bootstrap/bootstrap');

store.lastUpdate = parseInt(timestamp);

const writeFile = (path, json) => {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(path + ' updated.');
  fs.stat(path, (err, stats) => {
    fs.writeFile(path, content, callback);
  });
};

writeFile('./store.json', store);
