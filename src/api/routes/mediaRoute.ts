import Router from 'koa-router';
import { get, findByID, post } from '../functions/middlewares';
import { mediaService } from '../services/mediaService';

const mediaRouter = new Router({ prefix: '/media' });

// get all saved media or one saved media by link
mediaRouter.get('/', async context =>
  await get(context, mediaService.getAll, 'link', mediaService.findByLink));

// get media by Database ID
mediaRouter.get('/:id', async context =>
  await findByID(context, mediaService.findByID));

// creating new media
mediaRouter.post('/', async context =>
  await post(context, 'link', mediaService.save));

export { mediaRouter };
