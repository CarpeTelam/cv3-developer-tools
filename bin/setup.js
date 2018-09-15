const fs = require('fs');
const moment = require('moment');
const prompts = require('prompts');

function writeFile (path, json) {
  const content = JSON.stringify(json, null, 2);
  const callback = (error) => error ? console.log(error) : console.log(`${path} created.`);
  fs.stat(path, (err, stats) => fs.writeFile(path, content, callback));
}

(async () => {

  const { username, password, id } = await prompts([
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
    }
  ]);

  const timestamp = parseInt(moment().unix());

  if (username && password) {
    writeFile('./cv3-credentials.json', { username, password });
  }

  if (id) {
    writeFile('./store.json', { id, timestamp });
  }

})();
