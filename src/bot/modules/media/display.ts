import { Context } from 'discord-utils';
import { MediaService } from '../../api-link';
import { parseTags } from '../../utils/functions';
import PagedMessage from '../../utils/paged-message';

async function display(context: Context, ofUser?: boolean)
{
  let tagsText = context.raw_parameters;
  if(!tagsText)
    return context.send('❌  Please include tags to search.');
  const tags = parseTags(tagsText);
  const user = context.message.author.id;
  
  const getMedia = (page: number) => (ofUser?
    MediaService.findFromUserByTags(user, tags, 5, page) :
    MediaService.findByTags(tags, 5, page))
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
  const count = await (ofUser?
    MediaService.countFromUserByTags(user, tags) :
    MediaService.countByTags(tags));
  const media = await getMedia(1);
  context.message.channel.stopTyping(true);

  if(!count || count === 0)
    return context.send(`❌  ${ofUser? `You don't have` : `Can't find`}`
      + ` media with ${tags.length === 1? 'that tag' : 'all those tags'}.`);

  const title = `🔎  ${ofUser? 'You have' : 'Found'} ${count}`
    + ` media with tags: ${tags.map(tag => `**${tag.trim()}**`).join(', ')}`;
    
  new PagedMessage().send(context, title, media, Math.ceil(count / 5),
    async (page: number) => await getMedia(page + 1));
}

export { display };