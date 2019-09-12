import { Op } from 'sequelize';
import { Service } from './service';
import { Tag, UserMedia, User, MediaTag } from '../database/models';
import { userService } from './userService';

class TagService extends Service
{
  // finds a tag by name
  findByName(name: string)
  {
    return Tag.findOne({ where: { name } });
  }

  // find tags used by a user by either Discord or database ID
  async findUsedByUser(
    user_id: number | string,
    limit: number = 10,
    page: number = 1
  )
  {
    /* if the given `user_id` is a string it's a Discord ID,
      so get the database ID from the Discord ID */
    if(typeof user_id === 'string')
      user_id = await userService.findIDFromDiscordID(user_id);

    return Tag.findAll(
    {
      limit: limit,
      offset: limit * (page - 1),
      include:
      [
        {
          model: UserMedia,
          as: 'userMedia',
          where: { user_id }
        }
      ]
    });
  }

  // saves a tag (single)
  save(name: string)
  {
    name = name.trim().toLowerCase();
    return Tag.findOrCreate({ where: { name } });
  }

  // finds a tag by name and creates it if it doesn't exist
  findOrSave = (name: string) =>
  {
    return this.save(name);
  }

  /* Gets all tags in the database by tag names,
    and adds those that don't exist.
    If `get` is true, all the given tags will be returned.
    (non-existing ones will be added to the database first) */
  private async saveManyWithArgs(tags: string[], getAll?: boolean)
  {
     // making sure all tags are normalized
     tags = tags.map(tag => tag.trim().toLowerCase());

     // get all the existing tags to remove from the given tags (`data`)
     const existingTags: Tag[] = await Tag.findAll(
     {
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
 
       // if `get` is false, no need to return all the given tags
       if(!getAll)
         return createdTags;
 
       // re-add the created tags to the given tags then return
       existingTags.push(...createdTags);
       return existingTags;
     }

     if(getAll)
      return existingTags;
  }

  // saves tags (mutliple)
  saveMany = (tags: string[]) =>
  {
    return this.saveManyWithArgs(tags);
  }

  findOrSaveMany = (tags: string[]) =>
  {
    return this.saveManyWithArgs(tags, true);
  }

  // deletes a tag by name
  deleteByName(name: string)
  {
    return Tag.destroy({ where: { name } });
  }

  // deletes all tags that aren't used by any media
  async deleteUnused(tags: Tag[])
  {
    for(const tag of tags)
    {
      const useCount = await MediaTag.count({ where: { tag_id: tag.id } });
      if(useCount === 0)
        await tag.destroy();
    }
  }
}

const tagService = new TagService(Tag);
export { tagService };
