const { Command } = require('discord-utils');
const databasePath = `./src/api/database/database.sqlite`;

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = 'backup';
    this.action = action;
  }
}

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  context.chat('Media Database', false,
  {
    files:
    [{
      attachment: databasePath,
      name: 'database.sqlite'
    }]
  });
}
