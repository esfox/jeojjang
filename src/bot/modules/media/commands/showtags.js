const { Command } = require('discord-utils');
const { tagService } = require('../../../api-link');
const 
{
  command,
  alias,
  description
} = require('../../../config/commands-info').showtags;

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
  const tags = await tagService.findUsedByUser(context.message.author.id, 50)
    .then(tags => tags.map(({ name }) => name));
  context.message.channel.stopTyping(true);
  context.send(`🏷 You used ${tags.length} tags`, tags.join(', '));
}
