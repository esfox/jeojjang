import Router from 'koa-router';
import { MediaService } from '../services/MediaService';
import { TagService } from '../services/tagService';
import { UserService } from '../services/userService';

const mediaLimit = 25;

const parseTags = (tags: string) =>
  tags? tags.split(',').map(tag => tag.trim().toLowerCase())
    .filter(tag => tag) : null;

function getMedia(
  query: { tags?: string, limit?: number, page?: number },
  discordID?: string
)
{
  const limit = query.limit || mediaLimit;
  const page = query.page || 1;
  const tags = parseTags(query.tags);

  if(!discordID)
  {
    return !tags?
      MediaService.getAllWithTags(limit, page) :
      MediaService.findByTags(tags, limit, page);
  }

  return !tags?
    MediaService.findFromUser(discordID, limit, page) :
    MediaService.findFromUserByTags(discordID, tags, limit, page);
};

function countMedia(query: { tags?: string }, discordID?: string)
{
  const tags = parseTags(query.tags);
  if(!discordID)
  {
    return !tags?
      MediaService.countAll() :
      MediaService.countByTags(tags);
  }

  return !tags?
    MediaService.countFromUser(discordID) :
    MediaService.countFromUserByTags(discordID, tags);
}

const apiRouter = new Router({ prefix: '/api' });

// GET routes
apiRouter.get('/count', async context =>
  context.body = await countMedia(context.query));

apiRouter.get('/media', async context =>
  context.body = await getMedia(context.query));

apiRouter.get('/count/:discordID', async context =>
  context.body = await countMedia(context.query, context.params.discordID));

apiRouter.get('/media/:discordID', async context =>
  context.body = await getMedia(context.query, context.params.discordID));

apiRouter.get('/tags', async context => 
  context.body = await TagService.getAll());

apiRouter.get('/user/:discordID', async context =>
  context.body = await UserService.getDiscordUserData(context.params.discordID));

// POST routes
apiRouter.post('/media', async context =>
{
  const { discord_id, link, tags } = context.request.body;
  if(!discord_id || !link || !tags)
    return context.status = 400;

  context.body = await MediaService.save(link, discord_id, tags);
});

export { apiRouter };
