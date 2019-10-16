import { MediaService } from '../../api-link';
import { parseTags, getThumbnail } from '../../utils/functions';
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
  const updatedMedia = await (
    operation === Operation.add?
      MediaService.addTags(media, userID, tags) :
    operation === Operation.remove?
      MediaService.deleteTags(media, userID, tags) :
      MediaService.editTags(media, userID, tags));

  if(!updatedMedia)
    return context.send('❌  You have not saved that media.');
    
  const { tags: mediaTags } = updatedMedia;
  const { id, link } = updatedMedia;
  const embed = context.embed(`${
    operation === Operation.add?
      '✅  Added' :
    operation === Operation.remove?
      '🗑  Deleted' : '✏  Edited'
    } Tags`,
    `ID: ${id}\nMedia Link: ${link}\n\n`)
    .addField('New Tags', mediaTags.join(', '))
    .setThumbnail(getThumbnail(link));
  
  context.chat(embed); 
}

const editTags = (context: Context) => update(context, Operation.edit);
const addTags = (context: Context) => update(context, Operation.add);
const removeTags = (context: Context) => update(context, Operation.remove);

export { editTags, addTags, removeTags };
