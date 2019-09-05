import Router from 'koa-router';
import { tagService } from '../services/tagService';
import { get, findByID, post, destroy } from '../functions/middlewares';

const tagRouter = new Router({ prefix: '/tag' });
const nameProperty = 'name';

// get all tags or one by name
tagRouter.get('/', async context =>
  await get(context, tagService.getAll, nameProperty, tagService.findByName));

// get a tag by Database ID
tagRouter.get('/:id', async context =>
  await findByID(context, tagService.findByID));

// creating new tags
tagRouter.post('/', async context =>
{
  const { tags } = context.request.body;
  if(!tags)
    return await post(context, nameProperty, tagService.save);

  if(!Array.isArray(tags) || tags.length === 0)
    return context.status = 400;

  const createdTags = await tagService.saveMany(tags);
  if(!createdTags)
    return context.status = 409;

  context.body = createdTags;
});

tagRouter.delete('/:id', async context =>
  await destroy(context, tagService.deleteByID));

tagRouter.delete('/', async context =>
  await destroy(context, tagService.deleteByName, nameProperty));

export { tagRouter };
