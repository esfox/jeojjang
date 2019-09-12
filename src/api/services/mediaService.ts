import { Op } from 'sequelize';
import { Service } from './service';
import { Media, User, UserMedia, Tag } from '../database/models';
import { userService, whereIDorDiscordID } from '../services/userService';
import { tagService } from '../services/tagService';

const whereLinkOrID = (linkOrID: number | string) =>
  ({ [Op.or]: [ { id: linkOrID }, { link: linkOrID } ] });

enum MediaTagUpdate { Add, Edit, Delete };

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
      where: whereLinkOrID(linkOrID)
    });
  }

  // finds one media by link or ID from a user by Discord or database ID
  findByLinkOrIDFromUser(linkOrID: string | number, userID: number | string)
  {
    return UserMedia.findOne(
    {
      include:
      [
        {
          model: User,
          as: 'user',
          where: whereIDorDiscordID(userID)
        },
        {
          model: Media,
          as: 'media',
          where: whereLinkOrID(linkOrID)
        },
        { model: Tag, as: 'tags' }
      ]
    });
  }

  // handles both getAllFromUser and findWithTags
  private findWithArgs(
    userID?: number | string,
    tags?: string[],
    limit: number = 10,
    page: number = 1
  )
  {
    return UserMedia.findAll(
    {
      limit: limit,
      offset: limit * (page - 1),
      include:
      [
        {
          model: User,
          as: 'user',

          /* if the `userID` is given, a where clause that checks
            by Discord or database ID is used */
          where: userID? whereIDorDiscordID(userID) : {}
        },
        { model: Media, as: 'media' },
        {
          model: Tag,
          as: 'tags',

          /* if the tags is given and it only contains 1 element,
            a where clause is used for it instead of filtering
            the results after the query */
          where: tags && tags.length === 1? { name: tags.shift() } : {}
        }
      ]
    })
      /* if tags given contain more than 1 element,
        the results are filtered by tag name after the query */
      .then((userMedia: UserMedia[]) => tags && tags.length > 1? 
        userMedia.filter(userMedia =>
          tags.every(tag => userMedia.tags.some(({ name }) => tag === name))) :
        userMedia);
  }

  /* finds all media by tags from a user if the `userID`
    (database or Discord ID) is given */
  findWithTags = (
    tags: string[],
    userID?: number | string,
    limit?: number,
    page?: number
  ) =>
  {
    return this.findWithArgs(userID, tags, limit, page);
  }

  // get all media of a user by database or Discord ID
  findFromUser = (
    userID: number | string,
    limit?: number,
    page?: number
  ) =>
  {
    return this.findWithArgs(userID, null, limit, page);
  }

  // get all media of a user by Discord ID
  findFromDiscordUser = (
    discord_id: string,
    limit?: number,
    page?: number
  ) =>
  {
    return this.findFromUser(discord_id, limit, page);
  }

  // saves media, but finds it first to avoid duplicates
  save(link: string)
  {
    return Media.findOrCreate({ where: { link } });
  }
  
  // saves a media for a user by database ID or Discord ID with tag/s
  saveForUser = async (
    link: string,
    userID: number | string,
    tags: string | string[]
  ) =>
  {
    let [ user ] = await userService.findOrSave(userID);
    const [ media ] = await this.save(link);

    if(Array.isArray(tags))
      tags = await tagService.findOrSaveMany(tags);
    else
      [ tags ] = await tagService.findOrSave(tags);

    const [ userMedia ] = await UserMedia.findOrCreate(
    {
      where:
      {
        user_id: user.id,
        media_id: media.id
      }
    });

    await userMedia.setTags(Array.isArray(tags)? tags : [ tags ]);
    return userMedia;
  }

  // deletes by link or ID
  delete = (linkOrID: string | number) =>
  {
    return Media.destroy({ where: whereLinkOrID(linkOrID) });
  }

  /* deletes a media from a user using the media's link or ID
    and the user's Discord or database ID */
  deleteFromUser = async (linkOrID: number | string, userID: string | number) =>
  {
    const userMedia = await this.findByLinkOrIDFromUser(linkOrID, userID);
    const result = await userMedia.destroy();

    // deletes media that aren't used by any user
    await this.deleteUnused(userMedia.media_id);

    // deletes tags that aren't used by any media
    await tagService.deleteUnused(userMedia.tags);

    return result;
  }

  // deletes media not used saved by any user using the media's ID only
  async deleteUnused(id: number)
  {
    const useCount = await UserMedia.count({ where: { media_id: id } });
    return useCount === 0? Media.destroy({ where: { id } }) : null;
  }

  /* finds user media by link or ID and the user's Discord or database ID
    then adds, edits or deletes the tags of the user media */
  private async modifyUserMediaTags(
    linkOrID: string | number,
    userID: string | number,
    tags: string | string[],
    mediaTagUpdate: MediaTagUpdate
  )
  {
    const userMedia = await this.findByLinkOrIDFromUser(linkOrID, userID);
    if(!userMedia)
      return;

    // get tag instances from given tag names
    const tagObjects: Tag[] = await (Array.isArray(tags)?
      tagService.findOrSaveMany(tags) :
      tagService.findOrSave(tags).then(([ tag ]) => [ tag ]));

    if(mediaTagUpdate === MediaTagUpdate.Add)
      await userMedia.addTags(tagObjects);
    else if (mediaTagUpdate === MediaTagUpdate.Edit)
      await userMedia.setTags(tagObjects);
    else if(mediaTagUpdate === MediaTagUpdate.Delete)
      await userMedia.removeTags(tagObjects);

    // deletes tags that aren't used by any media
    if(mediaTagUpdate === MediaTagUpdate.Edit ||
      mediaTagUpdate === MediaTagUpdate.Delete)
      await tagService.deleteUnused(tagObjects);

    return userMedia;
  }

  // adds tags to a user media
  addUserMediaTags = async (
    linkOrID: string | number,
    userID: string | number,
    tags: string | string[]
  ) =>
  {
    return this.modifyUserMediaTags(
      linkOrID, userID, tags, MediaTagUpdate.Add);
  }

  // edits tags of a user media
  editUserMediaTags = async (
    linkOrID: string | number,
    userID: string | number,
    tags: string | string[]
  ) =>
  {
    return this.modifyUserMediaTags(
      linkOrID, userID, tags, MediaTagUpdate.Edit);
  }

  // deletes tags of a user media
  deleteUserMediaTags = async (
    linkOrID: string | number,
    userID: string | number,
    tags: string | string[]
  ) =>
  {
    return this.modifyUserMediaTags(
      linkOrID, userID, tags, MediaTagUpdate.Delete);
  }
}

const mediaService = new MediaService(Media);
export { mediaService };
