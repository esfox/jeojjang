import { mediaService } from '../../api-link';
import { parseTags } from '../../utils/functions';
import { Context } from 'discord-utils';
import { UserMedia } from '../../../api/database/models';

enum Operation
{
  edit,
  add,
  remove
}

async function update(context: Context, operation: Operation)
{
  if(!context.parameters)
    return context.send('❌  Please include the link or ID of the media'
      + ' and the new tags.');

  const userID = context.message.author.id;
  let [ media, ...tags ] = context.parameters;
  if(tags.length === 0)
    return context.send('❌  Please include the tags.');

  tags = parseTags(tags);

  context.message.channel.startTyping();
  const updatedMedia: UserMedia = await (
    operation === Operation.add?
      mediaService.addUserMediaTags(media, userID, tags) :
    operation === Operation.remove?
      mediaService.deleteUserMediaTags(media, userID, tags) :
      mediaService.editUserMediaTags(media, userID, tags));

  if(!updatedMedia)
    return context.send('❌  You have not saved that media.');
    
  const { tags: mediaTags } = updatedMedia;
  const { link } = updatedMedia.media;
  const embed = context.embed(`${
    operation === Operation.add?
      '✅  Added' :
    operation === Operation.remove?
      '🗑  Deleted' : '✏  Edited'
    } Tags`,
    `Media Link: ${link}\n\n`
    + `New Tags: ${mediaTags.map(({ name }) => `**${name}**`).join(', ')}`)
    .setThumbnail(link);
  
  context.chat(embed); 
}

const editTags = (context: Context) => update(context, Operation.edit);
const addTags = (context: Context) => update(context, Operation.add);
const removeTags = (context: Context) => update(context, Operation.remove);

export { editTags, addTags, removeTags };
