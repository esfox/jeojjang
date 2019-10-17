const { Command } = require('discord-utils');
const fetch = require('node-fetch');
const { isWebUri } = require('valid-url');

const { gfycatRegex, tagMaxLength } = require('../../../config');
const { sleep, parseTags } = require('../../../utils/functions');
const { MediaService }= require('../../../api-link');
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

const gfycatAPI = 'https://api.gfycat.com/v1/gfycats/';
const mediaTypes = [ 'image', 'video', 'gifv' ];

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
  const tooLongTag = tags.find(tag => tag.length > tagMaxLength);
  if(tooLongTag)
    return context.send(`❌  Tag name tag name`, `**${tooLongTag}**`
      + ' is too long.\nTags can only have a max of '
      + `__${tagMaxLength} characters__.`);

  if(!isWebUri(link))
    return context.send('❌  The link is not a valid URL.');

  if(!tags || tags.length === 0)
    return context.send('❌  Please include tags.');

  const [ embed ] = embeds;
  if(embed)
  {
    const { type, image, video } = embed;
    if(!mediaTypes.includes(type) && !video && !image)
      return context.send('❌  The link is not a valid media type.');
  }

  if(link.includes('gfycat.com') &&
    (!link.includes('giant') &&
    (!link.includes('.mp4') || !link.includes('.webm'))))
  {
    const [ , gfycatID ] = link.match(gfycatRegex);
    if(!gfycatID)
      return;

    const mp4URL = await fetch(gfycatAPI + gfycatID)
      .then(response => response.json())
      .then(json => json.gfyItem.mp4Url)
      .catch(error =>
      {
        console.error(error);
        context.send('❌  Unable to save gfycat. Try saving the **`.mp4`**'
          + ' URL of the gfycat instead.'
          + 'E.g. `https://giant.gfycat.com');
        return;
      });
    link = mp4URL;
  }

  if(!link.match(/gfycat\.com|youtube\.com|youtu\.be/g))
  {
    const { headers } = await fetch(link, { method: 'head' });
    const contentType = headers.get('content-type');
    if(!contentType || !mediaTypes.includes(contentType.split('/').shift()))
      return context.send('❌  The link is not a valid media type.');
  }

  save(context, link, tags);
} 

/** @param {import('discord-utils').Context} context*/
const save = async (context, link, tags) =>
{
  tags = parseTags(tags);
  
  context.message.channel.startTyping();
  const user = context.message.author.id;
  const saved = await MediaService.save(link, user, tags)
    .catch(error =>
    {
      console.error(error);
      return context.send('❌ Woops. A problem occured. Try again.');
    });
    
  if(!saved)
    return context.send('❌  You already saved that media.');

  const embed = context.embed('✅  Saved',
    `Tags: ${tags.map(tag => `**${tag}**`).join(', ')}\n`
    + `ID: __**${saved.id}**__`);

  context.chat(embed);
}
