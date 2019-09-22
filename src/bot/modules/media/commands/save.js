const { Command } = require('discord-utils');
const fetch = require('node-fetch');
const { isWebUri } = require('valid-url');

const { sleep, parseTags } = require('../../../utils/functions');
const { mediaService } = require('../../../api-link');
const
{
  command,
  alias,
  description
} = require('../../../config/commands-info').save;

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

const mediaTypes = [ 'image', 'video' ];

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  let parameters = context.parameters;
  if(!parameters)
    return context.send('❌  Please add the link or upload the media to save'
      + ' and tags to add to it.');

  const message = context.message;
  message.channel.startTyping();
  await sleep(1);

  const attachments = message.attachments.array();
  const embeds = message.embeds;
  const links = parameters.filter(parameter => isWebUri(parameter));
  if(attachments.length > 1 || embeds.length > 1 || links > 1)
    return context.send('❌  Cannot save more than 1 media.');

  const [ attachment ] = attachments;
  if(attachment && (attachment.width > 1 && attachment.height > 1))
  {
    const { url } = attachment;
    return save(context, url, parameters);
  }

  let [ link, ...tags ] = parameters;
  if(!isWebUri(link))
    return context.send('❌  The link is not a valid URL.');

  const [ embed ] = embeds;
  if(embed)
  {
    const { type, image, video } = embed;
    if(![ 'image', 'gifv', 'video' ].includes(type) && !video && !image)
      return context.send('❌  The link is not a valid media type.');
  }
  else
  {
    const { headers } = await fetch(link,
    {
      method: 'head'
    });
    if(!mediaTypes.includes(headers.get('content-type').split('/').shift()))
      return context.send('❌  The link is not a valid media type.');
  }

  save(context, link, tags);
} 

/** @param {import('discord-utils').Context} context*/
const save = async (context, link, tags) =>
{
  tags = parseTags(tags);

  context.message.channel.startTyping();
  const saved = await mediaService
    .saveForUser(link, context.message.author.id, tags);
  if(!saved)
    return context.send('❌  You already saved that media.');

  const embed = context.embed('✅  Saved',
    `Tags: ${tags.map(tag => `**${tag}**`).join(', ')}\n`
    + `ID: __**${saved.id}**__`);

  context.chat(embed);
}