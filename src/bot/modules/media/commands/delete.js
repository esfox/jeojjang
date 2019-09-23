const { Command } = require('discord-utils');
const { mediaService } = require('../../../api-link');
const
{
  command,
  alias,
  description
} = require('../../../config/commands-info').delete;

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
  if(!context.parameters)
    return context.send('❌  Please include the link or ID of the media.');

  const [ mediaLinkOrID ] = context.parameters;
  const userID = context.message.author.id;

  context.message.channel.startTyping();
  const deleted = await mediaService.deleteFromUser(mediaLinkOrID, userID);
  if(!deleted)
    return context.send('❌  You have not saved that media.');

  const embed = context.embed('🗑  Deleted your saved media', deleted.link)
    .setThumbnail(deleted.link)
    .setFooter(`ID: ${deleted.id}`);

  context.chat(embed);
}
