#!/usr/bin/env node

'use strict';

const fs = require('fs');
const moment = require('moment');

const timestamp = moment().unix();

const writeFile = (path, json) => {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(path + ' created.');
  fs.stat(path, (err, stats) => {
    if (typeof(stats) === 'undefined') {
      fs.writeFile(path, content, callback);
    } else {
      console.log(path + ' already exists.')
    }
  });
};

writeFile('./cv3-credentials.json', { username: '', password: '' });
writeFile('./store.json', { id: false, lastUpdate: parseInt(timestamp) });
