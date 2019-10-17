import { Context } from 'discord-utils';
import { MediaService } from '../../api-link';
import { parseTags } from '../../utils/functions';
import PagedMessage from '../../utils/paged-message';
// import { UserMedia } from '../../../api/database/models';

async function display(context: Context, ofUser?: boolean)
{
  let tagsText = context.raw_parameters;
  if(!tagsText)
    return context.send('❌  Please include tags to search.');
  const tags = parseTags(tagsText);
  
  // TODO: Apply pagination
  const getMedia = () /* page */ => (ofUser?
    MediaService.findFromUserByTags(context.message.author.id, tags/* , limit, page */) :
    MediaService.findByTags(tags/* , limit, page */))
      .then(media => !media?
        undefined :
        media.reduce((pages, { id, link }, i) =>
        {
          const index = Math.floor(i / 5);
          if(!pages[index])
            pages[index] = '';
        
          pages[index] += `\`#${id}\`:`
            + ` ${link.includes('gfycat')?
              link.replace('giant.', '').replace('.mp4', '') : link}\n`;
          return pages;
        }, []));

  context.message.channel.startTyping();
  const media = await getMedia();
  context.message.channel.stopTyping(true);

  if(!media || media.length === 0)
    return context.send(`❌  ${ofUser? `You don't have` : `Can't find`}`
      + ` media with ${tags.length === 1? 'that tag' : 'all those tags'}.`);

  // TODO: Fix `media.length`, it's not showing actual count of user media
  // const title = `🔎  ${ofUser? 'You have' : 'Found'} ${media.length}`
  //   + ` media with tags: ${tags.map(tag => `**${tag.trim()}**`).join(', ')}`;
  const title = `🔎  ${ofUser? 'Your media' : 'Media'} media with tags: `
    + tags.map(tag => `**${tag.trim()}**`).join(', ');
    
  new PagedMessage().send(context, title, media);

  // page => media.length > 4 && page === media.length - 1?
  //   getMedia(page) : media
}

export { display };