const { Command } = require('discord-utils');
const fs = require('fs');

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = 'backup';
    this.action = action;
  }
}

const backupPath = './backup';
const databasePath = './src/api/database/database.sqlite';

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  if(!fs.existsSync(backupPath))
    fs.mkdirSync(backupPath);

  try
  {
    fs.copyFileSync(databasePath, './backup');
  }
  catch(error)
  {
    console.log(error);
  }

  context.chat('✅  Database backed up.', false,
  {
    files:
    [{
      attachment: databasePath,
      name: 'database.sqlite'
    }]
  });
}
