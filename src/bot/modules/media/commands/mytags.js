const { Command } = require('discord-utils');
const { TagService } = require('../../../api-link');
const 
{
  command,
  alias,
  description
} = require('../../../config/commands-info').mytags;

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
  context.message.channel.startTyping();
  const tags = await TagService.findFromUser(context.message.author.id, 100);
  context.message.channel.stopTyping(true);
  context.send(`🏷 You used ${tags.length} tags`, tags.join(', '));
}
