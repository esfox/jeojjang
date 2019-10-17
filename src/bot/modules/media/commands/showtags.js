const { Command } = require('discord-utils');
const { getThumbnail } = require('../../../utils/functions');
const { MediaService }= require('../../../api-link');
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
  if(!context.parameters)
    return context.send('❌  Please add the link or ID of the media to show'
      + ' tags of.');

  const user = context.message.author.id;
  const [ linkOrID ] = context.parameters;

  context.message.channel.startTyping();
  const userMedia = await MediaService.getTags(linkOrID, user);
  if(!userMedia)
    return context.send('❌  You have not saved that media.');
  context.message.channel.stopTyping(true);
  
  const { id } = userMedia;
  const { link } = userMedia;
  const tags = userMedia.tags.join(', ');

  const embed = context.embed('🏷 Tags of...',
    `ID: ${id}\nLink: ${link}`)
    .addField('Tags', tags)
    .setThumbnail(getThumbnail(link));
  context.chat(embed);
}
