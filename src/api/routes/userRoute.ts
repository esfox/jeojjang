import Router from 'koa-router';
import { userService } from '../services/userService';
import { get, find, post, destroy } from '../functions/middlewares';

const userRouter = new Router({ prefix: '/user' });
const discordIDProperty = 'discord_id';

// get all users
userRouter.get('/', async context =>
  await get(context, userService.getAll, discordIDProperty, userService.findByID));

// get a user by database ID
userRouter.get('/:id', async context =>
  await find(context, userService.findByID));

// creating a new user
userRouter.post('/', async context =>
  await post(context, discordIDProperty, userService.save));

// deleting a user database ID
userRouter.delete('/:id', async context =>
  await destroy(context, userService.deleteByID));

// deleting a user by Discord ID
userRouter.delete('/', async context =>
  await destroy(context, userService.deleteByID, discordIDProperty));

export { userRouter };
