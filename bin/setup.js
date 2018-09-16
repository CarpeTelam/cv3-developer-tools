const fs = require('fs');
const moment = require('moment');
const prompts = require('prompts');

const baseDir = process.cwd();

function writeFile (path, json) {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(`${path} updated`);
  fs.stat(path, (err, stats) => fs.writeFile(path, content, callback));
}

(async () => {

  const { username, password, id, stagingURL } = await prompts([
    {
      type: 'text',
      name: 'username',
      message: 'What is your CV3 Username?'
    },
    {
      type: 'password',
      name: 'password',
      message: 'What is your CV3 Password?'
    },
    {
      type: 'number',
      name: 'id',
      message: 'What is your CV3 Store ID?'
    },
    {
      type: 'text',
      name: 'stagingURL',
      message: 'What is your CV3 Store Staging URL?'
    }
  ]);
  const timestamp = parseInt(moment().unix());

  if (username && password) {
    writeFile(`${baseDir}/cv3-credentials.json`, { username, password });
  }

  if (id || stagingURL) {
    writeFile(`${baseDir}/store.json`, { id, stagingURL, timestamp });
  }

})();
