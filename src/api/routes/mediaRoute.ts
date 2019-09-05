import Router from 'koa-router';
import { mediaService } from '../services/mediaService';
import { get, find, post, destroy } from '../functions/middlewares';

const mediaRouter = new Router({ prefix: '/media' });
const linkProperty = 'link';

// get all saved media or one saved media by link
mediaRouter.get('/', async context =>
  await get(context, mediaService.getAll, linkProperty, mediaService.findByLink));

// get media by ID
mediaRouter.get('/:id', async context =>
  await find(context, mediaService.findByID));

// creating new media
mediaRouter.post('/', async context =>
  await post(context, linkProperty, mediaService.save));

// delete media by ID
mediaRouter.delete('/:id', async context =>
  await destroy(context, mediaService.deleteByID));

// delete media by link
mediaRouter.delete('/', async context =>
  await destroy(context, mediaService.deleteByLink, linkProperty));

export { mediaRouter };
