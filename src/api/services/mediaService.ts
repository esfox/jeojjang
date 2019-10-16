import { Op } from 'sequelize';
import { Media, User, UserMedia, Tag } from '../database/models';
import { UserService, whereIDorDiscordID } from './userService';
import { TagService, parseTags } from './tagService';

enum MediaTagUpdate { Add, Edit, Delete };

interface Normalized
{
  id: number;
  media_id: number;
  link: string;
  tags: string[];
  createdAt: Date;
}

// necessary attributes to query
const queryAttributes =
[
  UserMedia.columns.id,
  UserMedia.columns.tags,
  UserMedia.columns.createdAt, 
];

function paginationOptions(limit: number = 25, page: number = 1)
{
  const options =
  {
    limit,
    offset: limit * (page - 1),
  }
  return options;
}

const includeMedia =
({
  model: Media, as: 'media',
  attributes:
  [
    Media.columns.id,
    Media.columns.link,
    Media.columns.createdAt
  ],
});

const includeUser = (discord_id: string) =>
({
  model: User, as: 'user', where: { discord_id },
});

const tagFindOption = (id: number | string) =>
  ({ tags: { [Op.substring]: `|${id}|` } });

const tagsFindOptions = async (tags: string[], getIDs: boolean = true) => 
{
  if(getIDs)
  {
    const tagIDs = await TagService.getIDs(tags);
    if(tagIDs.length == 0)
      return;

    return tagIDs.map(tagFindOption);
  }
  return tags.map(tagFindOption);
}

const stringifyTagIDs = (tags: any[]) =>
  `|${tags.reduce((string, item) => string + (item.id || item) + '|', '')}`;

// function to normalize query result (merge same media) 
const normalize = async (userMedia: UserMedia[]): Promise<Normalized[]> =>
{
  const allTagIDs = userMedia.reduce((allTags, { tags }) =>
    allTags.concat(parseTags(tags)), [])
      .filter((id, i, array) => array.indexOf(id) === i);

  const tagMap = await TagService.getTagMap(allTagIDs);
  const mediaTagsMap = userMedia.reduce((map, { media, tags }) =>
  {
    const parsedTags = parseTags(tags);
    if(map[media.id])
    {
      for(const parsedTag of parsedTags)
      {
        if(map[media.id].includes(parsedTag))
          continue;
        
        map[media.id].push(parsedTag);
      }
    }
    else map[media.id] = parsedTags;
    return map;
  }, {});

  for(const id of Object.keys(mediaTagsMap))
    mediaTagsMap[id] = mediaTagsMap[id].map((tagID: number) => tagMap[tagID]);

  const normalized: Normalized[] = [];
  for(const { id, media } of userMedia)
  {
    const mediaID = media.id;
    const link = media.link;
    if(normalized.some(({ media_id }) => media_id === mediaID))
      continue;

    normalized.push(
    {
      id,
      media_id: mediaID,
      link,
      tags: mediaTagsMap[mediaID],
      createdAt: media.createdAt,
    });
  }

  return normalized;
}

const deleteUnusedTags = async (tags: number[]) =>
{
  const unusedTags = (await Promise.all(tags.map(async tag => 
    ({ tag, count: await UserMedia.count({ where: tagFindOption(tag) }) }))))
    .filter(({ count }) => count === 0);
  if(unusedTags.length > 0)
    await TagService.deleteMultiple(unusedTags.map(({ tag }) => tag));
}

class MediaService
{
  static countAll(): Promise<number>
  {
    return Media.count();
  }

  static async getAllWithTags(limit?: number, page?: number): Promise<Normalized[]>
  {
    return UserMedia.findAll(
    {
      ...paginationOptions(limit, page),
      attributes: queryAttributes,
      include: [ includeMedia ],
    }).then(normalize);
  }

  /* finds one by media link or usermedia ID from
    a user by Discord or database ID */
  static findOne(linkOrID: string | number, discordID: string): Promise<UserMedia>
  {
    /* If linkOrID is a number, then it is referring to the UserMedia's ID.
      If not, it is referring to the media link. */
    const isByID = !isNaN(Number(linkOrID));
    return UserMedia.findOne(
    {
      where: isByID? { id: linkOrID } : {},
      include:
      [
        {
          model: User,
          as: 'user',
          where: whereIDorDiscordID(discordID)
        },
        {
          model: Media,
          as: 'media',
          where: !isByID? { link: linkOrID } : {}
        },
      ]
    });
  }

  static async getTags(linkOrID: string | number, discordID: string): Promise<UserMedia>
  {
    const userMedia: any = await this.findOne(linkOrID, discordID);
    const tags = await TagService.getTagMap(parseTags(userMedia.tags));
    userMedia.tags = Object.values(tags);
    return userMedia;
  }

  static async countByTags(tags: string[]): Promise<number>
  {
    const tagsOptions = await tagsFindOptions(tags);
    if(!tagsOptions)
      return;

    return UserMedia.count({ where: { [Op.and]: tagsOptions } });
  }

  static async findByTags(
    tags: string[],
    limit?: number,
    page?: number
  ): Promise<Normalized[]>
  {
    const tagsOptions = await tagsFindOptions(tags);
    if(!tagsOptions)
      return;

    return UserMedia.findAll(
    {
      ...paginationOptions(limit, page),
      attributes: queryAttributes,
      include: [ includeMedia ],
      where: { [Op.and]: tagsOptions },
    }).then(normalize);
  }

  static countFromUser(discordID: string): Promise<number>
  {
    return UserMedia.count({ include: [ includeUser(discordID) ] });
  }

  static async findFromUser(
    discordID: string,
    limit?: number,
    page?: number
  ): Promise<Normalized[]>
  {
    return UserMedia.findAll(
    {
      ...paginationOptions(limit, page),
      attributes: queryAttributes,
      include: [ includeMedia, includeUser(discordID) ],
    }).then(normalize);
  }

  static async countFromUserByTags(discordID: string, tags: string[]): Promise<number>
  {
    const tagsOptions = await tagsFindOptions(tags);
    if(!tagsOptions)
      return;

    return UserMedia.count(
    {
      where: { [Op.and]: tagsOptions },
      include: [ includeUser(discordID) ],
    });
  }

  static async findFromUserByTags(
    discordID: string,
    tags: string[],
    limit?: number,
    page?: number
  ): Promise<Normalized[]>
  {
    const tagsOptions = await tagsFindOptions(tags);
    if(!tagsOptions)
      return;

    return UserMedia.findAll(
    {
      ...paginationOptions(limit, page),
      attributes: queryAttributes,
      include: [ includeMedia, includeUser(discordID) ],
      where: { [Op.and]: tagsOptions }
    }).then(normalize);
  }

  // saves a media for a user by database ID or Discord ID with tag/s
  static async save(
    link: string, 
    discordID: string, 
    tags: string[]
  ): Promise<UserMedia>
  {
    // finds the user to add the media to and creates if it doesn't exist
    let [ user ] = await UserService.findOrSave(discordID);
    const [ media ] = await Media.findOrCreate({ where: { link } });

    // finds the tags for the media and creates if not existing\
    const tagsObjects: Tag[] = await TagService.findOrSave(tags);

    // saves the media for the user
    const [ userMedia, created ] = await UserMedia.findOrCreate(
    {
      where:
      {
        user_id: user.id,
        media_id: media.id
      },
      defaults: { tags: stringifyTagIDs(tagsObjects) },
    });
    return !created? null : userMedia;
  }

  /* deletes a media from a user using the media's link or ID
    and the user's Discord or database ID */
  static async delete(linkOrID: number | string, discordID: string)
  {
    const userMedia = await MediaService.findOne(linkOrID, discordID);
    if(!userMedia)
      return;

    const tags = parseTags(userMedia.tags);
    await userMedia.destroy();

    // deletes media that aren't used by any user
    const id = userMedia.media_id;
    const useCount = await UserMedia.count({ where: { media_id: id } });
    if(useCount === 0)
      await Media.destroy({ where: { id } });

    // deletes tags that aren't used by any media
    await deleteUnusedTags(tags);

    // TODO: delete users that don't have saved media
    return userMedia;
  }

/* finds user media by link or user media ID and the 
    user's Discord or database ID then adds, 
    edits or deletes the tags of the user media */
  private static async changeTags(
    linkOrID: string | number,
    discordID: string,
    tags: string[],
    mediaTagUpdate: MediaTagUpdate
  ): Promise<Normalized>
  {
    const userMedia: UserMedia = await this.findOne(linkOrID, discordID);
    if(!userMedia)
      return;

    const savedTags = parseTags(userMedia.tags);
    let newTags: any;
    if(mediaTagUpdate === MediaTagUpdate.Delete)
    {
      const tagIDs = await TagService.getIDs(tags);
      newTags = savedTags.filter(tag => !tagIDs.includes(tag));
    }
    else
    {
      const tagObjects = await TagService.findOrSave(tags);
      newTags = mediaTagUpdate === MediaTagUpdate.Add?
        tagObjects.filter(({ id }) => !savedTags.includes(id)) : tagObjects;
    }
     
    const removedTags = savedTags.filter(tag => !newTags.includes(tag));
    newTags = stringifyTagIDs(newTags);
    userMedia.tags = mediaTagUpdate === MediaTagUpdate.Add?
      userMedia.tags + newTags.substr(1) : newTags;

    const saved = await normalize([ await userMedia.save() ]);
    if(mediaTagUpdate !== MediaTagUpdate.Add)
      await deleteUnusedTags(removedTags);

    return saved.shift();
  }

  // adds tags to a user media
  static addTags(linkOrID: string | number, discordID: string, tags: string[])
  {
    return MediaService.changeTags(linkOrID, discordID, tags, MediaTagUpdate.Add);
  }

  // edits tags of a user media
  static editTags(linkOrID: string | number, discordID: string, tags: string[])
  {
    return MediaService.changeTags(linkOrID, discordID, tags, MediaTagUpdate.Edit);
  }

  // deletes tags of a user medsia
  static deleteTags(linkOrID: string | number, discordID: string, tags: string[])
  {
    return MediaService.changeTags(linkOrID, discordID, tags, MediaTagUpdate.Delete);
  }
}

export { MediaService };
