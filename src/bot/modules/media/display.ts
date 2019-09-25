import { Context } from 'discord-utils';
import { mediaService } from '../../api-link';
import { parseTags } from '../../utils/functions';
import PagedMessage from '../../utils/paged-message';
import { UserMedia } from '../../../api/database/models';

async function display(context: Context, ofUser?: boolean)
{
  let tagsText = context.raw_parameters;
  if(!tagsText)
    return context.send('❌  Please include tags to search.');
  const tags = parseTags(tagsText);
  
  const getMedia = () /* page */ => mediaService.findWithTags(tags,
    ofUser? context.message.author.id : undefined /* , limit, page */)
    .then((media: UserMedia[]) => media.reduce((pages, { id, media }, i) =>
    {
      const index = Math.floor(i / 5);
      if(!pages[index])
        pages[index] = '';
    
      pages[index] += `\`#${id}\`: ${media.link}\n`;
      return pages;
    }, []));

  context.message.channel.startTyping();
  const media = await getMedia();
  context.message.channel.stopTyping(true);

  if(media.length === 0)
    return context.send(`❌  ${ofUser? `You don't have` : `Can't find`}`
      + ` media with ${tags.length === 1? 'that tag' : 'all those tags'}.`);

  const title = `🔎  ${ofUser? 'You have' : 'Found'} ${media.length}`
    + ` media with tags: ${tags.map(tag => `**${tag.trim()}**`).join(', ')}`;
    
  new PagedMessage().send(context, title, media);

  // page => media.length > 4 && page === media.length - 1?
  //   getMedia(page) : media
}

export { display };