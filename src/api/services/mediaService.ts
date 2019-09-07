import { Op } from 'sequelize';
import { Service } from './service';
import { Media, User, UserMedia, Tag } from '../database/models';
import { userService } from '../services/userService';
import { tagService } from '../services/tagService';

class MediaService extends Service
{
  // finds one media by link only
  findByLink(link: string)
  {
    return Media.findOne({ where: { link } });
  }

  // finds one media by link or ID
  findByLinkOrID(linkOrID: string | number)
  {
    return Media.findOne(
    {
      where:
      {
        [Op.or]: [ { id: linkOrID }, { link: linkOrID }, ]
      }
    });
  }

  // handles both getAllFromUser and findWithTags
  private findWithArgs(user_id?: number | string, tags?: string[])
  {
    return UserMedia.findAll(
    {
      include:
      [
        {
          model: User,
          as: 'user',

          /* if the user_id is given, it checks if the given ID
            is a number(database ID) or a string (Discord ID)
            and uses a where clause for it */
          where: user_id?
            { [typeof user_id === 'number'? 'id' : 'discord_id']: user_id } :
            {}
        },
        { model: Media, as: 'media' },
        {
          model: Tag,
          as: 'tags',

          /* if the tags is given and it only contains 1 element,
            a where clause for it is used instead of filtering
            the results after the query */
          where: tags && tags.length === 1? { name: tags.shift() } : {}
        }
      ]
    })
      /* if tags given contain more than 1 element,
        the results are filtered by tag name */
      .then((userMedia: UserMedia[]) => tags && tags.length > 1? 
        userMedia.filter(userMedia =>
          tags.every(tag => userMedia.tags.some(({ name }) => tag === name))) :
        userMedia);
  }

  // finds all media by tags from a user (if ID is given)
  findWithTags = (tags: string[], user_id?: number | string) =>
  {
    return this.findWithArgs(user_id, tags);
  }

  // get all media of a user by database or Discord ID with tags (if given)
  findFromUser = (user_id: number | string, tags?: string[]) =>
  {
    return this.findWithArgs(user_id, tags);
  }

  // get all media of a user by Discord ID
  findFromDiscordUser(discord_id: string)
  {
    return this.findFromUser(discord_id);
  }

  // saves media, but finds it first to avoid duplicates
  save(link: string)
  {
    return Media.findOrCreate({ where: { link } });
  }
  
  // saves a media for a user by database ID or Discord ID
  saveForUser = async (link: string, user_id: number | string, tags: string[]) =>
  {
    let [ user ] = await userService.findOrSave(user_id);
    const [ media ] = await this.save(link);
    tags = await tagService.findOrSaveMany(tags);

    const [ userMedia ] = await UserMedia.findOrCreate(
    {
      where:
      {
        user_id: user.id,
        media_id: media.id
      }
    });

    await userMedia.setTags(tags);
    return userMedia;
  }

  // deletes by link
  deleteByLink(link: string)
  {
    return Media.destroy({ where: { link } });
  }
}

const mediaService = new MediaService(Media);
export { mediaService };
