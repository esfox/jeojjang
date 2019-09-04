import Router from 'koa-router';
import { isWebUri } from 'valid-url';
import { badRequest, notFound } from '../functions/error-responses';
import { mediaService } from '../services/mediaService';

const mediaRouter = new Router({ prefix: '/media' });

// get all saved media or one saved media by link
mediaRouter.get('/', async context =>
{
  const { link } = context.query;
  if(!link)
    return context.body = await mediaService.getAll();

  const media = await mediaService.findByLink(link);
  if(!media)
    return notFound(context, `Media with link "${link}" not found.`);

  context.body = media;
});

// get media by Database ID
mediaRouter.get('/:id', async context =>
{
  const { id } = context.params;
  if(!id)
    return badRequest(context, 'Please include the `id` param.');

  const media = await mediaService.findByID(id);
  if(!media)
    return notFound(context, `Media with ID "${id}" not found.`);

  context.body = media;
});

// creating new media
mediaRouter.post('/', async context =>
{
  // TODO: validate link
  const { link } = context.request.body;
  if(!link)
    return badRequest(context, 'Please include the `link` property.');

  if(!isWebUri(link))
    return badRequest(context, '`link` is not a valid URL.');

  const [ , wasCreated ] = await mediaService.save(link);
  if(!wasCreated)
    return badRequest(context, `Media with link "${link}" already exists.`);

  context.body = 'Media has been saved.';
});

export { mediaRouter };
