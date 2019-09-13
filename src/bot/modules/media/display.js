const { mediaService } = require('../../api-link');

const PagedMessage = require('../../utils/paged-message');

/** 
 * @param {import('discord-utils').Context} context
 * @param {boolean} [ofUser]
 * */
module.exports = async (context, ofUser) =>
{
  let tags = context.raw_parameters;
  if(!tags)
    return context.send('❌  Please include tags to search.');
  tags = tags.split(',').filter(tag => tag);

  context.message.channel.startTyping();
  const media = await mediaService.findWithTags(tags,
    ofUser? context.message.author.id : undefined);
  context.message.channel.stopTyping(true);

  if(media.length === 0)
    return context.send(`❌  ${ofUser? `You don't have` : `Can't find`}`
      + ` media with ${tags.length === 1? 'that tag' : 'all those tags'}.`);

  // TODO: query per page switch
  const pages = media.reduce((pages, { id, media }, i) =>
  {
    const index = Math.floor(i / 5);
    if(!pages[index])
      pages[index] = '';
  
    pages[index] += `\`#${id}\`: ` + media.link + '\n';
    return pages;
  }, []);

  const title = `🔎  ${ofUser? 'You have' : 'Found'} ${media.length}`
    + ` media with tags: ${tags.map(tag => `**${tag.trim()}**`).join(', ')}`;
    
  new PagedMessage().send(context, title, pages);
}
