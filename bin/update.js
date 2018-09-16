const fs = require('fs');
const moment = require('moment');
const path = require('path');
const request = require('request');

const baseDir = process.cwd();
const timestamp = parseInt(moment().unix());

const credentialsPath = `${baseDir}/cv3-credentials.json`;
const credentials = fs.existsSync(credentialsPath) ? require(credentialsPath) : false;
const storePath = `${baseDir}/store.json`;
const store = fs.existsSync(storePath) ? require(storePath) : false;

if (!credentials || !store || credentials.username === '' || credentials.password === '' || store.id === '') {
  console.log('Please run `npm run setup` to create the proper config files.');
  process.exit(1);
}

const filesCodePath = `${baseDir}/store/files_code/`;
const templatePath = `${baseDir}/store/templates/`;

const baseURI = 'https://store.commercev3.com';
const getDataURI = `${baseURI}/GetData`;

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
  uri: baseURI,
  method: 'POST',
  jar: jar,
  headers: {
    'User-Agent': 'CV3 Developer Tools for Nodejs: Update Template'
  }
};

const getTemplateOptions = {
  uri: `${getDataURI}/template_edit/${store.id}/_top.tpl`,
  method: 'GET',
  jar: jar
};

const getJavascriptOptions = {
  uri: `${getDataURI}/template_js_edit/${store.id}/all`,
  method: 'GET',
  jar: jar
};

const getStylesheetOptions = {
  uri: `${getDataURI}/styles_edit/${store.id}/styles`,
  method: 'GET',
  jar: jar
};

function loginCallback (error, response, body) {
  output && console.log('loginCallback started');
  // Right now we only handle templates, javascript, and stylesheets. We could
  // possibly add image and file upload functionality in the future.
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
   output && console.log('loginCallback finished');
}

function getTemplateCallback (error, response, body) {
  output && console.log('getTemplateCallback started');
  const json = JSON.parse(body);
  fs.readFile(filePath, 'utf8', function (error, data) {
    const form = {
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
  output && console.log('getTemplateCallback finished');
}

function setTemplateCallback (error, response, body) {
  // needs error feedback: should test for error on img_prefix, and possibly other errors like `
  output && console.log('Template Updated');
}

function getJavascriptCallback (error, response, body) {
  output && console.log('getJavascriptCallback started');
  const json = JSON.parse(body);
  fs.readFile(filePath, 'utf8', function (error, data) {
    const form = {
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
  output && console.log('getJavascriptCallback finished');
}

function setJavascriptCallback (error, response, body) {
  // needs error feedback
  output && console.log('Javascript Updated');
}

function getStylesheetCallback (error, response, body) {
  output && console.log('getStylesheetCallback started');
  const json = JSON.parse(body);
  fs.readFile(filePath, 'utf8', function (error, data) {
    const form = {
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
  output && console.log('getStylesheetCallback finished');
}

function setStylesheetCallback (error, response, body) {
  // needs error feedback
  output && console.log('Stylesheet Updated');
}

function update (updatePath) {
  output && console.log('update started');
  filePath = updatePath;
  file = path.parse(filePath);
  request(postFormOptions, loginCallback).form(loginForm);
  output && console.log('updated finished');
}

function getModifiedFiles (path) {
  output && console.log('getModifiedFiles started');
  const filter = (filePath) => store.timestamp < moment(fs.statSync(filePath).mtime).unix();
  try {
    const stats = fs.statSync(path);
    if (stats.isDirectory()) {
      return fs.readdirSync(path).map((filename) => path + filename).filter(filter);
    }
  } catch (exception) {
    return [];
  }
  output && console.log('getModifiedFiles finished');
}

function writeFile (path, json) {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(`${path} updated`);
  fs.stat(path, (err, stats) => fs.writeFile(path, content, callback));
}

(() => {

  const files = [...getModifiedFiles(filesCodePath), ...getModifiedFiles(templatePath)];

  const fileCountText = `${files.length} File${files.length > 1 ? 's' : ''}`;
  console.log(`${fileCountText} to update: ${JSON.stringify(files, null, 2)}`);
  files.forEach(filePath => update(filePath));

  writeFile(`${baseDir}/store.json`, { ...store, timestamp });

})();
