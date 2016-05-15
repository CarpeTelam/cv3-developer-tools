#! /usr/bin/env node

'use strict';

const fs = require('fs');
const moment = require('moment');
const path = require('path');
const request = require('request');

const timestamp = moment().unix();

const credentials = require('../cv3-credentials');
let store = require('../store');

let jar = request.jar();

let filePath = '';
let file = '';
let output = false;

const loginForm = {
  action: 'Login',
  username: credentials.username,
  password: credentials.password
};

const postFormOptions = {
  uri: 'https://store.commercev3.com/',
  method: 'POST',
  jar: jar,
  headers: {
    'User-Agent': 'CV3 Developer Tools for Nodejs: Update Template'
  }
};

const getTemplateOptions = {
  uri: 'https://store.commercev3.com/GetData/template_edit/' + store.id + '/node_test.tpl',
  method: 'GET',
  jar: jar
};

const getJavascriptOptions = {
  uri: 'https://store.commercev3.com/GetData/template_js_edit/' + store.id + '/node_test',
  method: 'GET',
  jar: jar
};

const getStylesheetOptions = {
  uri: 'https://store.commercev3.com/GetData/styles_edit/' + store.id + '/node_test',
  method: 'GET',
  jar: jar
};

var loginCallback = function (error, response, body) {
  switch (file.ext) {
    case '.tpl':
      request(getTemplateOptions, getTemplateCallback);
      break;
    case '.js':
      request(getJavascriptOptions, getJavascriptCallback);
      break;
    case '.css':
      request(getStylesheetOptions, getStylesheetCallback);
      break;
    default:
      console.log(filePath);
      console.log('Invalid file type');
   }
};

var getTemplateCallback = function (error, response, body) {
  var json = JSON.parse(body);
  fs.readFile(filePath, 'utf8', function(error, data) {
    var form = {
      action: 'EditTemplate',
      locked: json.locked && json.locked.locked_status ? json.locked.locked_status : '',
      stylesheet_locked: json.stylesheet_locked && json.stylesheet_locked.locked_status ? json.stylesheet_locked.locked_status : '',
      title: json.meta && json.meta.title ? json.meta.title : '',
      description: json.meta && json.meta.description ? json.meta.description : '',
      keywords: json.meta && json.meta.keywords ? json.meta.keywords : '',
      styles: json.styles || '',
      curr_category: json.cats && json.cats.template ? json.cats.template : '',
      category: json.cats && json.cats.template ? json.cats.template : '',
      common_name: json.common_name || '',
      curr_common_name: json.common_name || '',
      template: data,
      filename: file.base,
      override_img_prefix: json.override_img_prefix || '',
      submit: 'Save and Quit'
    };
    request(postFormOptions, setTemplateCallback).form(form);
  });
};

var setTemplateCallback = function (error, response, body) {
  console.log(body);
  // should put some feedback for the user here? should test for error on img_prefix, and possibly other errors like `
  if (output) {
    console.log('Template Updated');
  }
};

var getJavascriptCallback = function (error, response, body) {
  var json = JSON.parse(body);
  fs.readFile(filePath, 'utf8', function (error, data) {
    var form = {
      action: 'EditJS',
      file: file.name,
      filename: file.base,
      locked: json.locked && json.locked.locked_status ? json.locked.locked_status : '',
      type: json.type || '',
      common_name: json.common_name || '',
      curr_common_name: json.common_name || '',
      data: data,
      submit: 'Save and Quit'
    };
    request(postFormOptions, setJavascriptCallback).form(form);
  });
};

var setJavascriptCallback = function (error, response, body) {
  // should put some feedback for the user here?
  if (output) {
    console.log('Javascript Updated');
  }
};

var getStylesheetCallback = function (error, response, body) {
  var json = JSON.parse(body);
  fs.readFile(filePath, 'utf8', function(error, data) {
    var form = {
      action: 'EditStyles',
      file: file.name,
      locked: json.locked && json.locked.locked_status ? json.locked.locked_status : '',
      common_name: json.common_name || '',
      curr_common_name: json.common_name || '',
      styles: data,
      submit: 'Save and Quit'
    };
    request(postFormOptions, setStylesheetCallback).form(form);
  });
};

var setStylesheetCallback = function (error, response, body) {
  // should put some feedback for the user here?
  if (output) {
    console.log('Stylesheet Updated');
  }
};

var update = function (updatePath) {
  filePath = updatePath;
  file = path.parse(filePath);
  request(postFormOptions, loginCallback).form(loginForm);
}

const codePath = './store/files_code/';
const templatePath = './store/templates/';

let modifiedFiles = [];

const getModifiedFiles = (path) => {
  const filter = (filePath) => {
    let timestamp = moment(fs.statSync(filePath).mtime).unix();
    return timestamp > store.lastUpdate;
  };
  try {
    const stats = fs.statSync(path);
    if (stats.isDirectory()) {
      return fs.readdirSync(path).map((filename) => path + filename).filter(filter);
    }
  } catch (exception) {
    return false;
  }
};

const codeFiles = getModifiedFiles(codePath);
const templateFiles = getModifiedFiles(templatePath);

let files = [];

if (!codeFiles || !templateFiles) {
  console.log('Download a store backup to ./extract/store/ and then run `npm run unzip`');
} else {
  files = codeFiles.concat(templateFiles)
}

console.log(files);

store.lastUpdate = parseInt(timestamp);

const writeFile = (path, json) => {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(path + ' updated.');
  fs.stat(path, (err, stats) => {
    fs.writeFile(path, content, callback);
  });
};

writeFile('./store.json', store);
