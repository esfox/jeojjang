import Router from 'koa-router';
import { get, findByID, post } from '../functions/middlewares';
import { tagService } from '../services/tagService';

const tagRouter = new Router({ prefix: '/tag' });

// get all tags or one by name
tagRouter.get('/', async context =>
  await get(context, tagService.getAll, 'name', tagService.findByName));

// get a tag by Database ID
tagRouter.get('/:id', async context =>
  await findByID(context, tagService.findByID));

// creating new tags
tagRouter.post('/', async context =>
{
  const { tags } = context.request.body;
  if(!tags)
    return await post(context, 'name', tagService.save);

  if(!Array.isArray(tags) || tags.length === 0)
    return context.status = 400;

  const createdTags = await tagService.saveMany(tags);
  if(!createdTags)
    return context.status = 409;

  context.body = createdTags;
});

export { tagRouter };
