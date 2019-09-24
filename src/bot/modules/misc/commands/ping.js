const { Command } = require('discord-utils');
const
{
  command,
  description
} = require('../../../config/commands-info').ping;

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = command;
    this.action = action;
    this.description = description;
  }
}

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  context.send(`📶  ${~~context.bot.ping} ms`);
}