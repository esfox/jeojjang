const { Command } = require('discord-utils');

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = 'test';
    this.action = action;
  }
}

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  context.chat('hi');
}
