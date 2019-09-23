const { Command } = require('discord-utils');
const { addTags } = require('../updateTags');
const
{
  command,
  alias,
  description
} = require('../../../config/commands-info').addtags;

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = command;
    this.aliases.push(alias);
    this.action = action;
    this.description = description;
  }
}

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  addTags(context);
}
