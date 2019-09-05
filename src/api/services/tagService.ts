import { Op } from 'sequelize';
import { Service } from './service';
import { Tag } from '../database/models';

class TagService extends Service
{
  // finds a tag by name
  findByName(name: string)
  {
    return Tag.findOne({ where: { name } });
  }

  // save a tag (single)
  save = (name: string) =>
  {
    return this.findOrSave(name);
  }

  // save tags (mutliple)
  saveMany = (tags: string[]) =>
  {
    return this.findOrSaveMany(tags, false);
  }

  // finds a tag by name and creates it if it doesn't exist
  async findOrSave(name: string)
  {
    name = name.trim().toLowerCase();
    return Tag.findOrCreate({ where: { name } });
  }

  /* Gets all tags in the database by tag names,
    and adds those that don't exist.
    If `get` is true, all the given tags will be returned.
    (non-existing ones will be added to the database first) */
  async findOrSaveMany(tags: string[], get?: boolean)
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
      if(!get)
        return createdTags;

      // re-add the created tags to the given tags then return
      existingTags.push(...createdTags);
      return existingTags;
    }
  }
}

const tagService = new TagService(Tag);
export { tagService };
