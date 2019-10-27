const { Command } = require('discord-utils');
const fetch = require('node-fetch');
const { isWebUri } = require('valid-url');

const { sleep, parseTags } = require('../../../utils/functions');

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = 'savemany';
    this.action = action;
  }
}

// TODO: Finish this, verify each link
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

  const media = attachments.concat(links)
    .filter(async link =>
    {
      if(!link.match(/gfycat\.com|youtube\.com|youtu\.be/g))
      {
        const { headers } = await fetch(link, { method: 'head' });
        const contentType = headers.get('content-type');
        // return !contentType ||
        //   !mediaTypes.includes(contentType.split('/').shift());
      }
      return true;
    });

  // const tags = parameters.filter(parameter => !links.includes(parameter));
  let tags = parameters.join(' ').match(/\(([^)]+)\)/g);
  if(!tags || tags.length === 0)
    return context.send('❌  Please include the tags.');
  tags = tags.shift();
  tags = parseTags(tags.slice(1, tags.length - 1));

  context.chat(text);
}
