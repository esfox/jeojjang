import { Op } from 'sequelize';
import { Tag, UserMedia, User } from '../database/models';
import { whereIDorDiscordID } from './userService';

const parseTags = (tags: string): number[] => 
  tags.substring(1, tags.length - 1).split('|').map(id => parseInt(id));

class TagService
{
  static async getAll(): Promise<Tag[]> 
  {
    return Tag.findAll();
  }

  static async getAllFromUser(discord_id: string): Promise<Tag[]>
  {
    const tagIDs = await UserMedia.findAll(
    {
      attributes: [ UserMedia.columns.tags ],
      include: [{ model: User, as: 'user', where: { discord_id }, }]
    }).then((tagIDs: UserMedia[]) => tagIDs
      .reduce((tags, { tags: ids }) => tags.concat(parseTags(ids))
      .filter((id, i, array) => array.indexOf(id) === i), []));
    return Tag.findAll({ where: { id: { [Op.in]: tagIDs } } });
  }

  // get the string of the IDs of tags given
  static async getIDs(tags: string[]): Promise<number[]>
  {
    return Tag.findAll(
    {
      attributes: [ Tag.columns.id ],
      where: { name: { [Op.in]: tags } },
    }).then((ids: [{ id: number }]) => ids.map(({ id }) => id));
  }

  static async getTagMap(ids: number[]): Promise<object[]>
  {
    return Tag.findAll(
    {
      attributes: [ Tag.columns.id, Tag.columns.name ],
      where: { id: { [Op.in]: ids } },
    }).then((tags: Tag[]) => tags.reduce((map, { id, name }) =>
    {
      map[id] = name;
      return map;
    }, {}));
  }

  // find tags used by a user by either Discord or database ID
  static async findFromUser(
    discordID: string,
    limit: number = 10,
    page: number = 1
  )
  {
    const tagIDs = await UserMedia.findAll(
    {
      limit: limit,
      offset: limit * (page - 1),
      attributes: [ UserMedia.columns.tags ],
      include:
      [
        {
          model: User,
          as: 'user',
          where: whereIDorDiscordID(discordID)
        },
      ]
    }).then((userMedia: UserMedia[]) =>
    {
      const tagIDs = userMedia.reduce((allTags, { tags }) =>
        allTags.concat(parseTags(tags)), [])
      return [ ...new Set(tagIDs) ];
    });

    const tagMap = await TagService.getTagMap(tagIDs);
    return Object.values(tagMap);
  }

  /* Gets all tags in the database by tag names,
    and adds those that don't exist. */
  static async findOrSave(tags: string[]): Promise<Tag[]>
  {
    // making sure all tags are normalized
    tags = tags.map(tag => tag.trim().toLowerCase());

    // if only 1 tag is given, just find or create
    if(tags.length === 1)
      return Tag.findOrCreate({ where: { name: tags.shift() } })
        .then(([ result ]) => [ result ]);

    // get all the existing tags to remove from the given tags (`data`)
    const existingTags: Tag[] = await Tag.findAll(
    {
      attributes: [ Tag.columns.id, Tag.columns.name ],
      where: { name: { [Op.in]: tags } }
    });

    /* map to the tag names because given tags is a string array
      then remove the existing tags from it (to be added to the database) */ 
    const existingTagNames = existingTags.map(({ name }) => name);
    const notExistingTags = tags
      .filter(name => !existingTagNames.includes(name))
      .map(name => ({ name }));

    // add the non-existing tags to the database
    if(notExistingTags.length > 0)
    {
      const createdTags = await Tag.bulkCreate(notExistingTags);
      existingTags.push(...createdTags);
    }

    return existingTags;
  }

  static deleteMultiple(tagIDs: number[])
  {
    return Tag.destroy({ where: { id: { [Op.in]: tagIDs } } });
  }
}

export { TagService, parseTags };
