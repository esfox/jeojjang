const { Command } = require('discord-utils');
const { editTags } = require('../updateTags');
const
{
  command,
  alias,
  description
} = require('../../../config/commands-info').edittags;

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
  editTags(context);
}
